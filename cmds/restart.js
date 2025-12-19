const { exec } = require('child_process');
const config = require('../config.json');

module.exports = {
    name: 'restart',
    description: 'Restarts the bot process via PM2.',
    aliases: ['reboot', 'rb'],
    usage: 'restart',
    customDescription: '🔄 Restart the bot process.',
    async execute(message) {
        // Owner-only check
        if (message.author.id !== config.owner) {
            return message.channel.send('You do not have permission to use this command.');
        }

        await message.channel.send('Restarting bot...');

        exec('pm2 restart 1', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting PM2 process: ${error.message}`);
                message.channel.send(`Failed to restart bot: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`PM2 stderr: ${stderr}`);
                // Don't send stderr to the channel, but log it.
            }
            console.log(`PM2 stdout: ${stdout}`);
            // The bot will restart, so no confirmation message is needed here.
        });
    },
};
