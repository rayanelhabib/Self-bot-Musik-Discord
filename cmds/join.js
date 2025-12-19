const config = require('../config.json');

module.exports = {
    name: 'join',
    description: 'Makes the bot join your current voice channel.',
    aliases: ['j'],
    usage: 'join',
    customDescription: '📞 Make the bot join your current voice channel.',
    async execute(message) {
        // Owner and admin check
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        if (!message.member.voice.channel) {
            return message.channel.send('❌ You need to be in a voice channel to use this command!');
        }

        let player = message.client.lavalink.getPlayer(message.guild.id);

        if (player && player.connected) {
            return message.channel.send('✅ I am already in a voice channel.');
        }

        try {
            if (!player) {
                 player = message.client.lavalink.createPlayer({
                    guildId: message.guild.id,
                    voiceChannelId: message.member.voice.channel.id,
                    textChannelId: message.channel.id,
                    selfDeaf: true,
                    selfMute: true,
                });
            }
            
            await player.connect();
            await message.channel.send(`✅ Joined **${message.member.voice.channel.name}**.`);
        } catch (error) {
            console.error('Error joining voice channel:', error);
            await message.channel.send(`❌ Failed to join the voice channel: ${error.message || 'Unknown error'}`);
        }
    },
};
