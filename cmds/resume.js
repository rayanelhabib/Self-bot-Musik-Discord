const config = require('../config.json');

module.exports = {
    name: 'resume',
    aliases: ['r'],
    description: 'Resume the paused track',
    usage: 'resume',
    customDescription: '▶️ Resume playing the paused music.',
    async execute(message, args, client) {
        const player = client.lavalink.getPlayer(message.guild.id);
        
        if (!player?.queue?.current) {
            return message.channel.send('No track currently playing!');
        }

        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        if (!player.paused) {
            return message.channel.send('Player is not paused!');
        }

        await player.resume();
        return message.channel.send('▶️ Resumed playback');
    }
};