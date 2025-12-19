const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    name: 'removeadmin',
    aliases: ['ra', 'rma'],
    description: 'Remove an admin from the bot.',
    usage: 'removeadmin <user ID>',
    customDescription: '🚫 Remove an admin user by ID.',
    async execute(message, args) {
        if (message.author.id !== config.owner) {
            return message.channel.send('❌ You are not authorized to use this command.');
        }

        if (args.length === 0) {
            return message.channel.send('Please provide a user ID to remove.');
        }

        const adminIdToRemove = args[0];

        if (adminIdToRemove === config.owner) {
            return message.channel.send('❌ You cannot remove the owner.');
        }

        const configPath = path.join(__dirname, '../config.json');
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (!currentConfig.adminIds.includes(adminIdToRemove)) {
            return message.channel.send('❌ That user is not an admin.');
        }

        currentConfig.adminIds = currentConfig.adminIds.filter(id => id !== adminIdToRemove);

        try {
            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4), 'utf8');
            // Also update the in-memory config
            config.adminIds = config.adminIds.filter(id => id !== adminIdToRemove);
            message.channel.send(`✅ Successfully removed ${adminIdToRemove} from the admin list. The change is effective immediately.`);
        } catch (error) {
            console.error('Error writing to config.json:', error);
            message.channel.send('❌ Failed to update the configuration file.');
        }
    },
};
