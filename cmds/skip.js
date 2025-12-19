const config = require('../config.json');

module.exports = {
    name: 'skip',
    aliases: ['s'],
    description: 'Skip the currently playing track',
    usage: 'skip',
    customDescription: '⏭️ Skip to the next song in the queue.',
    async execute(message) {
        // OWNER check
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        const player = message.client.lavalink.getPlayer(message.guild.id);

        if (!player || !player.queue.current) {
            return message.reply('❌ No song is currently playing.');
        }

        const skippedTrack = player.queue.current;
        const wasLastTrack = player.queue.size === 0;

        try {
            // player.skip() will stop the current track and trigger the trackEnd event, which will start the next song.
            await player.skip();
            return message.reply(`⏭️ Skipped: **${skippedTrack.info.title}**`);
        } catch (error) {
            console.error('Error skipping track:', error);
            return message.reply('❌ Failed to skip the track.');
        }
    },
};
