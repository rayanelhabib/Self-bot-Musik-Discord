const config = require('../config.json'); 

module.exports = {
    name: 'stop',
    aliases: ['st', 'leave', 'disconnect'],
    description: 'Stop the music and leave the voice channel',
    usage: 'stop',
    customDescription: '⏹️ Stop all music and disconnect from the voice channel.',
    async execute(message, args) {
        // OWNER-ONLY CHECK
        if (!(message.author.id === config.owner || config.adminIds.includes(message.author.id))) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.players.get(message.guild.id);
        if (!player) {
            return message.channel.send('⚠️ There is no music playing.');
        }

        try {
            player.destroy(); 
            await message.channel.send('⏹️ Music stopped and disconnected from the voice channel.');
        } catch (error) {
            console.error('Error in stop command:', error);
            await message.channel.send(`❌ Failed to stop music: ${error.message || 'Unknown error'}`);
        }
    },
};
