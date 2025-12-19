const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    name: 'addadmin',
    aliases: ['aa', 'a', 'addadmin'],
    description: 'Add a new admin to the bot.',
    usage: 'addadmin <user ID>',
    customDescription: '👤 Add a new admin user by ID.',
    async execute(message, args) {
        if (message.author.id !== config.owner) {
            return message.channel.send('❌ You are not authorized to use this command.');
        }

        if (args.length === 0) {
            return message.channel.send('Please provide a user ID to add as an admin.');
        }

        const newAdminId = args[0];

        if (!/^\d{17,19}$/.test(newAdminId)) {
            return message.channel.send('❌ Please provide a valid user ID.');
        }

        const configPath = path.join(__dirname, '../config.json');
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (currentConfig.adminIds.includes(newAdminId)) {
            return message.channel.send('✅ That user is already an admin.');
        }

        currentConfig.adminIds.push(newAdminId);

        try {
            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4), 'utf8');
            // Also update the in-memory config
            config.adminIds.push(newAdminId);
            message.channel.send(`✅ Successfully added ${newAdminId} as an admin. The change is effective immediately.`);
        } catch (error) {
            console.error('Error writing to config.json:', error);
            message.channel.send('❌ Failed to update the configuration file.');
        }
    },
};
