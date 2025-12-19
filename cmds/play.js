const config = require('../config.json'); 

function getPlayerPosition(player) {
    if (!player.playing || player.paused) return player.position;
    return player.position || 0;
}

function formatTime(milliseconds) {
    if (!milliseconds || isNaN(milliseconds)) return "00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function createTrackMessage(track, isNowPlaying = false, queuePosition = null, player = null) {
    if (!isNowPlaying && queuePosition === 0 && !player?.queue?.current) {
        return null;
    }

    const trackUrl = track.info.uri;
    const artistText = track.info.author ? ` by ${track.info.author}` : '';
    const hyperlink = `[${track.info.title}${artistText}](${trackUrl})`;

    const messageText = isNowPlaying
        ? `Started playing **${hyperlink}**`
        : `Added track to queue:\n${hyperlink}`;

    return messageText;
}

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song or playlist in your voice channel',
    usage: 'play <song name or URL>',
    customDescription: '🎶 Play music from YouTube, Spotify, or direct links. Supports playlists.',
    async execute(message, args) {
        // OWNER CHECK
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        if (!message.member.voice.channel) {
            return message.channel.send('❌ You need to be in a voice channel to play music!');
        }

        if (!args.length) {
            return message.channel.send('❌ Please provide a song to play!');
        }

        let player = message.client.lavalink.getPlayer(message.guild.id);

        if (!player) {
            player = message.client.lavalink.createPlayer({
            guildId: message.guild.id,
            voiceChannelId: message.member.voice.channel.id,
            textChannelId: message.channel.id,
            selfDeaf: true,
            selfMute: true,
            volume: 90,
        });
        }

        const query = args.join(' ');

        try {
            if (!player.connected) {
                await player.connect();
            }

            if (!player.get('queueRepeatStartIndex')) player.set('queueRepeatStartIndex', 0);
            if (!player.get('queueRepeatHandlerSet')) player.set('queueRepeatHandlerSet', false);
            if (!player.get('initialQueueStored')) {
                player.set('initialQueueStored', true);
                if (!player.get('queueRepeatInitialTrack')) player.set('queueRepeatInitialTrack', null);
                if (!player.get('queueRepeatInitialQueue')) player.set('queueRepeatInitialQueue', []);
            }

            const isUrl = query.match(/^https?:\/\//i);

            async function searchWithProvider(searchQuery, provider, retryCount = 0) {
                try {
                    const searchTerm = provider ? `${provider}:${searchQuery}` : searchQuery;
                    const result = await player.search(searchTerm, { requester: message.author });

                    if (result.loadType === "error" && result.exception?.severity === "fault") {
                        console.error(`Error with ${provider}:`, result.exception);

                        if (result.exception?.cause?.includes("Mp3 frame not found") && retryCount < 2) {
                            console.log(`Retrying with different provider due to MP3 frame error... Attempt ${retryCount + 1}`);
                            if (provider === 'ytsearch') {
                                return searchWithProvider(searchQuery, 'ytsearch', retryCount + 1);
                            }
                        }

                        if (provider === 'spsearch' && result.exception?.message?.includes('mirror')) {
                            console.log('Spotify mirror error, trying SoundCloud...');
                            const scResult = await searchWithProvider(searchQuery, 'scsearch', retryCount);

                            if (scResult.loadType === "empty" || scResult.loadType === "error") {
                                console.log('SoundCloud search failed, trying YouTube...');
                                return searchWithProvider(searchQuery, 'ytsearch', retryCount);
                            }
                            return scResult;
                        }

                        if (provider === 'dzsearch' && result.exception?.cause?.includes("Mp3 frame not found")) {
                            console.log('dzsearch MP3 frame error, trying YouTube directly...');
                            return searchWithProvider(searchQuery, 'ytsearch', retryCount);
                        }

                        return { loadType: "empty" };
                    }

                    return result;
                } catch (error) {
                    console.error(`Error searching with ${provider}:`, error);
                    return { loadType: "empty" };
                }
            }

            let res;
            // Prioritize Spotify for non-URL queries
            if (!isUrl) {
                res = await searchWithProvider(query, 'spsearch');
                // Fallback to YouTube if Spotify fails
                if (!res || res.loadType === 'empty' || res.loadType === 'error') {
                    console.log(`[Play] Spotify search failed, falling back to YouTube for query: ${query}`);
                    res = await searchWithProvider(query, 'ytsearch');
                }
            } else {
                // Handle URL inputs directly
                res = await player.search(query, { requester: message.author });
            }

            if (res.loadType === "error" || res.loadType === "empty") {
                return message.channel.send(`❌ No matches found for this track!`);
            }

            const wasPlaying = player.playing || player.paused;

            // Add the tracks to the queue.
            if (res.loadType === "playlist") {
                for (const track of res.tracks) {
                    player.queue.add(track);
                }
                await message.channel.send(`✅ Added playlist with **${res.tracks.length}** tracks to the queue.`);
            } else {
                const track = res.tracks[0];
                player.queue.add(track);
                await message.channel.send(`✅ Added **${track.info.title}** to the queue.`);
            }

            // If the player is not already playing, start it.
            if (!wasPlaying) {
                await player.play();
            }
        } catch (error) {
            console.error('Error in play command:', error);
            await message.channel.send(`❌ Error: ${error.message || 'An unknown error occurred'}`);
        }
    },
};