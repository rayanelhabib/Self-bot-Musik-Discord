const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    name: 'autoplay',
    aliases: ['ap', 'auto'],
    description: 'Toggle autoplay for this guild. When enabled, related tracks will be queued automatically.',
    usage: 'autoplay',
    customDescription: '🔁 Toggle autoplay: automatically queue related tracks when a song ends.',
    async execute(message) {
        // OWNER and admin check
        if (message.author.id !== config.owner && !config.adminIds.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const guildId = message.guild.id;
        const autoplayPath = path.join(__dirname, '..', 'autoplay.json');

        let autoplayData = {};
        try {
            if (fs.existsSync(autoplayPath)) {
                autoplayData = JSON.parse(fs.readFileSync(autoplayPath, 'utf8')) || {};
            }
        } catch (err) {
            console.error('[Autoplay] Failed to read autoplay.json:', err);
            return message.channel.send('❌ Failed to read autoplay settings.');
        }

        const current = !!autoplayData[guildId];
        autoplayData[guildId] = !current;

        try {
            fs.writeFileSync(autoplayPath, JSON.stringify(autoplayData, null, 2), 'utf8');
        } catch (err) {
            console.error('[Autoplay] Failed to write autoplay.json:', err);
            return message.channel.send('❌ Failed to save autoplay setting.');
        }

        if (autoplayData[guildId]) {
            return message.channel.send('✅ Autoplay is now **enabled** for this server.');
        } else {
            return message.channel.send('⛔ Autoplay is now **disabled** for this server.');
        }
    },
};
