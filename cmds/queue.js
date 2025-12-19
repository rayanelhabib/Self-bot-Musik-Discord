const config = require('../config.json');

module.exports = {
    name: 'queue',
    description: 'Show the current music queue',
    usage: 'queue',
    customDescription: '📋 Display the current queue with up to 10 upcoming tracks.',
    aliases: ['q'],
    async execute(message) {
        const player = message.client.lavalink.players.get(message.guild.id);

        if (!player || (!player.playing && player.queue.size === 0)) {
            return message.channel.send('❌ Nothing is playing and the queue is empty!');
        }

        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const current = player.queue.current;
        const tracks = player.queue.tracks;

        let queueText = `🎶 Now Playing: ${current.info.title} (${formatDuration(current.info.length)})\n${current.info.uri}\n\n`;

        if (tracks.length === 0) {
            queueText += `🔕 No upcoming tracks in the queue.`;
        } else {
            queueText += `📜 Up Next:\n`;
            const upcoming = tracks.slice(0, 10).map((track, index) => {
                return `${index + 1}. ${track.info.title} (${formatDuration(track.info.length)})\n${track.info.uri}`;
            }).join('\n\n');

            queueText += upcoming;
            if (tracks.length > 10) {
                queueText += `\n\n...and ${tracks.length - 10} more.`;
            }
        }

        await message.channel.send(queueText);
    },
};

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
