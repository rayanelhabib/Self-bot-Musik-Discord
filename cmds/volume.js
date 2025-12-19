const config = require('../config.json');

module.exports = {
    name: 'volume',
    aliases: ['v', 'vol'],
    description: 'Set the playback volume (10-100)',
    usage: 'volume <10-100>',
    customDescription: '🔊 Adjust the music volume (10-100%).',
    async execute(message, args) {
        
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.players.get(message.guild.id);
        if (!player || !player.playing) {
            return message.channel.send('⚠️ No music is currently playing.');
        }

        const input = parseInt(args[0]);

        if (isNaN(input)) {
            return message.channel.send('🔊 Please provide a number between 10 and 100.');
        }

        if (input < 10 || input > 100) {
            return message.channel.send('🔊 Volume must be between 10 and 100.');
        }

        player.setVolume(input);
        return message.channel.send(`✅ Volume set to **${input}%**.`);
    },
};
