const config = require('../config.json');

module.exports = {
  name: 'pause',
  aliases: ['pa'],
  description: 'Pause the current track',
  usage: 'pause',
  customDescription: '⏸️ Pause the currently playing music.',
  async execute(message, args, client) {
    if (!(message.author.id === config.owner || config.adminIds.includes(message.author.id))) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const player = client.lavalink.getPlayer(message.guild.id);

    if (!player?.queue?.current) {
      return message.channel.send('No track currently playing!');
    }

    if (player.paused) {
      await player.resume();
      return message.channel.send('▶️ Resumed playback');
    }

    await player.pause(true);
    return message.channel.send('⏸️ Paused playback');
  }
};
