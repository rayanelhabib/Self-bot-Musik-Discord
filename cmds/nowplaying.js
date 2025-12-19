const config = require('../config.json');

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createProgressBar(player) {
    const duration = player.queue.current.info.length;
    const position = player.position;
    const progress = Math.floor((position / duration) * 20);
    const progressBar = '─'.repeat(progress) + '🔘' + '─'.repeat(19 - progress);
    return `[${progressBar}]`;
}

module.exports = {
    name: 'nowplaying',
    aliases: ['np', 'current'],
    description: 'Shows the currently playing track.',
    usage: 'nowplaying',
    customDescription: '🎵 Display information about the currently playing track with a progress bar.',
    async execute(message) {
        if (!(message.author.id === config.owner || config.adminIds.includes(message.author.id))) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.players.get(message.guild.id);
        if (!player || !player.playing) {
            return message.channel.send('⚠️ No track is currently playing.');
        }

        const track = player.queue.current;
        const position = formatDuration(player.position);
        const duration = formatDuration(track.info.length);
        const progressBar = createProgressBar(player);

        const response = `🎶 **Now Playing:**\n**${track.info.title}**\n*Requested by: ${track.requester.username}*\n\n${position} ${progressBar} ${duration}\n${track.info.uri}`;

        return message.channel.send(response);
    },
};
