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

module.exports = {
  name: 'myaliases',
  aliases: ['ma', 'listalias', 'myalias'],
  description: 'Show your personal aliases',
  usage: 'myaliases',
  customDescription: '📋 Display all your personal aliases',
  async execute(message, args, client) {
    try {
      const userAliases = loadUserAliases();
      const myAliases = userAliases[message.author.id];

      if (!myAliases || Object.keys(myAliases).length === 0) {
        return message.reply('❌ You don\'t have any personal aliases yet!\nUse `-addalias <alias> <command>` to create one.');
      }

      let aliasText = '📋 **Your Personal Aliases:**\n\n';
      for (const [alias, command] of Object.entries(myAliases)) {
        aliasText += `\`-${alias}\` → \`${command}\`\n`;
      }

      aliasText += `\n_Total: ${Object.keys(myAliases).length} alias(es)_`;

      message.reply(aliasText);
    } catch (error) {
      console.error('[MyAliases] Error:', error);
      message.reply('❌ Error loading your aliases!');
    }
  },
};
