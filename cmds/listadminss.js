const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    name: 'listadminss',
    aliases: ['listadmins', 'la', 'admins'],
    description: 'List all admin IDs (Owner only).',
    usage: 'listadminss',
    customDescription: '📋 Display all current admin user IDs.',
    async execute(message, args, client) {
        if (message.author.id !== config.owner) {
            return message.channel.send('❌ You are not authorized to use this command.');
        }

        const configPath = path.join(__dirname, '../config.json');
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (currentConfig.adminIds.length === 0) {
            return message.channel.send('No admins found.');
        }

        // Try to fetch usernames for each admin ID
        const adminLines = await Promise.all(currentConfig.adminIds.map(async (adminId) => {
            let displayName = adminId;
            try {
                // Try to get the user from the client's cache or fetch if not present
                let user = client.users.cache.get(adminId);
                if (!user) {
                    user = await client.users.fetch(adminId).catch(() => null);
                }
                if (user) {
                    displayName = user.username;
                }
            } catch (e) {}
            return `🟢 ${adminId} - ${displayName}`;
        }));

        message.channel.send(`Admin List:\n${adminLines.join('\n')}`);
    },
}; 