const config = require('../config.json');

module.exports = {
    name: 'help',
    description: 'Shows a list of all available commands.',
    aliases: ['h', 'commands'],
    async execute(message, args, client) {
        // Check permission - allow owner and admins
        const isOwner = message.author.id === config.owner;
        const isAdmin = config.adminIds && config.adminIds.includes(message.author.id);
        
        if (!isOwner && !isAdmin) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        try {
            const commands = Array.from(client.commands.values());
            
            // Create header
            let header = `${'='.repeat(50)}\n🎵 **MUSIC BOT COMMANDS**\nPrefix: \`${config.prefix}\`\n${'='.repeat(50)}\n`;
            
            // Split commands into chunks to avoid 2000 character limit
            let messages = [header];
            let currentMessage = '';

            commands.forEach(command => {
                const usage = command.usage ? ` \`${command.usage}\`` : '';
                const aliases = command.aliases && command.aliases.length > 0 ? `${command.aliases.join(', ')}` : 'None';
                const customDesc = command.customDescription || command.description || 'No description';
                
                const commandText = `**${config.prefix}${command.name}**${usage}\n└─ ${customDesc}\nAliases: ${aliases}\n\n`;

                // If adding this command would exceed limit, start a new message
                if ((currentMessage + commandText).length > 1900) {
                    if (currentMessage) {
                        messages.push(currentMessage);
                    }
                    currentMessage = commandText;
                } else {
                    currentMessage += commandText;
                }
            });

            // Add remaining content
            if (currentMessage) {
                messages.push(currentMessage);
            }

            // Add footer to last message
            messages[messages.length - 1] += `\n${'='.repeat(50)}\nTotal Commands: ${commands.length}`;

            // Send all messages via DM
            for (const msg of messages) {
                await message.author.send(msg);
            }

            if (message.channel.type !== 'dm') {
                await message.reply(`✅ Check your DMs! (${messages.length} message${messages.length > 1 ? 's' : ''})`);
            }
        } catch (error) {
            console.error(`[Help] Error:`, error);
            await message.reply('❌ Error sending help! Check console for details.');
        }
    },
};
