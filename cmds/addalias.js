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
  name: 'addalias',
  aliases: ['aa'],
  description: 'Add a personal alias to a command',
  usage: 'addalias <alias> <command>',
  customDescription: '✏️ Create a personal alias for any command (e.g., `-addalias mymusic play`)',
  async execute(message, args, client) {
    try {
      if (args.length < 2) {
        return message.reply('❌ Usage: `-addalias <your_alias> <command_name>`\nExample: `-addalias mymusic play`');
      }

      const newAlias = args[0].toLowerCase();
      const commandName = args[1].toLowerCase();

      // Validate command exists
      if (!client.commands.has(commandName)) {
        return message.reply(`❌ Command \`${commandName}\` does not exist!`);
      }

      // Load user aliases
      const userAliases = loadUserAliases();
      if (!userAliases[message.author.id]) {
        userAliases[message.author.id] = {};
      }

      // Check if alias already exists (global or personal)
      const globalAliasExists = client.aliases.has(newAlias);
      const personalAliasExists = Object.values(userAliases).some(u => u[newAlias]);

      if (globalAliasExists) {
        return message.reply(`❌ Alias \`${newAlias}\` already exists as a global alias!`);
      }

      if (personalAliasExists) {
        return message.reply(`❌ Alias \`${newAlias}\` is already taken by another user!`);
      }

      // Add the alias
      userAliases[message.author.id][newAlias] = commandName;
      saveUserAliases(userAliases);

      // Register in client immediately
      client.aliases.set(newAlias, commandName);

      message.reply(`✅ Personal alias \`${newAlias}\` added! Now you can use \`-${newAlias}\` for \`${commandName}\``);
    } catch (error) {
      console.error('[AddAlias] Error:', error);
      message.reply('❌ Error adding alias!');
    }
  },
};
