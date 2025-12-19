const config = require('../config.json');
const fs = require('fs');
const path = require('path');

const aliasesPath = path.join(__dirname, '../userAliases.json');

function loadUserAliases() {
  try {
    if (fs.existsSync(aliasesPath)) {
      return JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
    }
  } catch (error) {
    console.error('[Aliases] Error loading userAliases.json:', error);
  }
  return {};
}

function saveUserAliases(data) {
  try {
    fs.writeFileSync(aliasesPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[Aliases] Error saving userAliases.json:', error);
  }
}

module.exports = {
  name: 'removealias',
  aliases: ['ra', 'rmalias'],
  description: 'Remove a personal alias',
  usage: 'removealias <alias>',
  customDescription: '🗑️ Remove one of your personal aliases',
  async execute(message, args, client) {
    try {
      if (args.length < 1) {
        return message.reply('❌ Usage: `-removealias <your_alias>`\nExample: `-removealias mymusic`');
      }

      const aliasToRemove = args[0].toLowerCase();

      // Load user aliases
      const userAliases = loadUserAliases();
      
      if (!userAliases[message.author.id] || !userAliases[message.author.id][aliasToRemove]) {
        return message.reply(`❌ You don't have a personal alias \`${aliasToRemove}\`!`);
      }

      // Remove the alias
      const commandName = userAliases[message.author.id][aliasToRemove];
      delete userAliases[message.author.id][aliasToRemove];
      saveUserAliases(userAliases);

      // Unregister from client
      client.aliases.delete(aliasToRemove);

      message.reply(`✅ Personal alias \`${aliasToRemove}\` removed!`);
    } catch (error) {
      console.error('[RemoveAlias] Error:', error);
      message.reply('❌ Error removing alias!');
    }
  },
};
