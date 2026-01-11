const config = require('../config.json');
const http = require('http');
const https = require('https');

module.exports = {
    name: 'lyrics',
    aliases: ['ly', 'lyr'],
    description: 'Get the lyrics for the currently playing song.',
    usage: 'lyrics',
    customDescription: '📝 Fetch lyrics for the currently playing song.',
    async execute(message, args) {
        // Owner and admin check
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.getPlayer(message.guild.id);

        if (!player || !player.playing) {
            return message.channel.send('❌ Nothing is currently playing.');
        }

        const currentTrack = player.queue.current;
        if (!currentTrack) {
            return message.channel.send('❌ Could not find the current track.');
        }

        // Use the Lavalink password from your config, assuming it's stored there
        const lavalinkPassword = config.lavalink_password || 'nextgen'; 

        const options = {
            hostname: 'localhost',
            port: 2334, // Your Lavalink port from application.yml
            path: `/v4/lyrics?trackId=${encodeURIComponent(currentTrack.encoded)}`,
            method: 'GET',
            headers: {
                'Authorization': lavalinkPassword
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode !== 200) {
                        return message.channel.send(`❌ The lyrics server responded with an error: ${res.statusCode}`);
                    }

                    if (response.type === 'error' || !response.lyrics) {
                        const reason = response.message || 'The server did not provide a reason.';
                        return message.channel.send(`❌ No lyrics found for **${currentTrack.info.title}**. Reason: _${reason}_`);
                    }

                    const lyrics = response.lyrics;
                    const maxChars = 2000;

                    if (lyrics.length <= maxChars) {
                        message.channel.send(`**Lyrics for ${currentTrack.info.title}**:\n\n${lyrics}`);
                    } else {
                        // Split lyrics into multiple messages
                        message.channel.send(`**Lyrics for ${currentTrack.info.title}**:`);
                        for (let i = 0; i < lyrics.length; i += maxChars) {
                            const chunk = lyrics.substring(i, i + maxChars);
                            message.channel.send(chunk);
                        }
                    }
                    } catch (e) {
                    console.error('Error parsing lyrics response:', e);
                    // Try external fallback
                    fetchExternalLyrics(currentTrack.info.title, currentTrack.info.author)
                        .then(lyricsText => {
                            if (!lyricsText) return message.channel.send('❌ An error occurred while fetching lyrics.');
                            message.channel.send(`**Lyrics for ${currentTrack.info.title}**:`);
                            const maxChars = 2000;
                            for (let i = 0; i < lyricsText.length; i += maxChars) {
                                message.channel.send(lyricsText.substring(i, i + maxChars));
                            }
                        })
                        .catch(err => {
                            console.error('External lyrics fallback failed:', err);
                            message.channel.send('❌ An error occurred while fetching lyrics.');
                        });
                }
            });
        });

        req.on('error', error => {
            console.error('Error requesting lyrics:', error);
            // Attempt external fallback before giving up
            fetchExternalLyrics(currentTrack.info.title, currentTrack.info.author)
                .then(lyricsText => {
                    if (!lyricsText) return message.channel.send('❌ Failed to connect to the lyrics server and no fallback lyrics found. Ensure the lyrics service is running on port 2334.');
                    message.channel.send(`**Lyrics for ${currentTrack.info.title}**:`);
                    const maxChars = 2000;
                    for (let i = 0; i < lyricsText.length; i += maxChars) {
                        message.channel.send(lyricsText.substring(i, i + maxChars));
                    }
                })
                .catch(err => {
                    console.error('External lyrics fallback failed:', err);
                    message.channel.send('❌ Failed to connect to the lyrics server. Ensure the lyrics service is running on port 2334.');
                });
        });

        req.end();
        
        // Fallback: query a public lyrics API (some-random-api.ml) if local lyrics server fails
        function fetchExternalLyrics(title, author) {
            return new Promise((resolve, reject) => {
                try {
                    const query = encodeURIComponent(`${title} ${author || ''}`.trim());
                    const url = `https://some-random-api.ml/lyrics?title=${query}`;
                    https.get(url, res => {
                        let body = '';
                        res.on('data', chunk => body += chunk);
                        res.on('end', () => {
                            try {
                                const j = JSON.parse(body);
                                if (j && j.lyrics) return resolve(j.lyrics);
                                return resolve(null);
                            } catch (e) {
                                return reject(e);
                            }
                        });
                    }).on('error', e => reject(e));
                } catch (e) { reject(e); }
            });
        }
    },
};
