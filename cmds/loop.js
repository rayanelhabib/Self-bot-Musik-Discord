const config = require('../config.json');

module.exports = {
    name: 'loop',
    aliases: ['l', 'repeat'],
    description: 'Toggle repeat mode for the current track',
    usage: 'loop',
    customDescription: '🔁 Toggle repeat mode on/off for the current track.',
    async execute(message) {
        if (!(message.author.id === config.owner || config.adminIds.includes(message.author.id))) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.players.get(message.guild.id);
        if (!player || !player.playing) {
            return message.channel.send('⚠️ No track is currently playing.');
        }

        const currentRepeatMode = player.repeatMode;

        if (currentRepeatMode === 'track') {
            player.setRepeatMode('off');
            return message.channel.send('🔁 Loop disabled.');
        } else {
            player.setRepeatMode('track');
            return message.channel.send('🔂 Loop enabled for the current track.');
        }
    },
};
