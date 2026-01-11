const { Client, Collection, RichPresence } = require('discord.js-selfbot-v13');
const { LavalinkManager } = require('lavalink-client');
const YouTube = require('youtube-sr').default;
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

// Global error handlers to prevent unhandled errors from crashing the process
process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught Exception:', error);
  // Continue running instead of crashing
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection:', reason);
  // Continue running instead of crashing
});

const client = new Client({
  checkUpdate: false,
});

client.commands = new Collection();
client.aliases = new Collection();

// Load user personal aliases
const aliasesPath = path.join(__dirname, 'userAliases.json');
let userAliasesData = {};
try {
  if (fs.existsSync(aliasesPath)) {
    userAliasesData = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
  }
} catch (error) {
  console.error('[Boot] Error loading userAliases.json:', error);
}

// Load commands
const commandsPath = path.join(__dirname, 'cmds');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name && command.execute) {
    client.commands.set(command.name, command);
    
    // Use custom aliases from config if available, otherwise use command's default aliases
    let aliasesToUse = [];
    if (config.commandAliases && config.commandAliases[command.name]) {
      aliasesToUse = config.commandAliases[command.name];
    } else if (command.aliases && Array.isArray(command.aliases)) {
      aliasesToUse = command.aliases;
    }
    
    // Register all aliases
    aliasesToUse.forEach(alias => {
      client.aliases.set(alias, command.name);
    });
  }
}

// Register personal user aliases
for (const userId in userAliasesData) {
  for (const alias in userAliasesData[userId]) {
    client.aliases.set(alias, userAliasesData[userId][alias]);
  }
}

// Lavalink config in index.js (not config.json)
client.lavalink = new LavalinkManager({

  nodes: [
    {
      id: 'main',
      host: 'lavalink_v4.muzykant.xyz',
      port: 443,
      authorization: 'https://discord.gg/v6sdrD9kPh',
      secure: true,
      // reduce forced closes on internal errors
      closeOnError: false,
      retryAmount: 5,
      retryDelay: 3000,
      requestTimeout: 30000,
    },
  ],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId); 
    if (guild && guild.shard) guild.shard.send(payload);
  },
  linksAllowed: true,
  autoSkip: true,
  client: {}, // will set after ready
  queueStore: null,
  autoResume: true,
  emitNewSongsOnly: true,
  playerOptions: {
    clientBasedPositionUpdateInterval: 150,
    defaultSearchPlatform: 'spsearch',
    onDisconnect: { autoReconnect: false, destroyPlayer: true },
    maxErrorsPerTime: { threshold: 10000, maxAmount: 20 },
    onEmptyQueue: { destroyAfterMs: 90000 },
    useUnresolvedData: true,
  },
  linksBlacklist: [],
  linksWhitelist: [],
  connectOptions: {
    reconnect: false,
    resumeKey: 'default',
    resumeTimeout: 30,
    userAgent: 'Selfbot/1.4.0',
  },
});

// Increase max listeners to avoid warnings and prevent errors from crashing
client.lavalink.setMaxListeners(100);
if (client.lavalink.NodeManager) client.lavalink.NodeManager.setMaxListeners(100);

// Lavalink events
client.lavalink.on('nodeConnect', node => console.log(`[Lavalink] Node "${node.id}" connected`));
// --- Robust Lavalink node reconnect logic (Jockie-style) ---
const lavalinkReconnectAttempts = {};

function reconnectLavalinkNode(node) {
  const maxAttempts = 10;
  const baseDelay = 3000; // 3 seconds
  if (!lavalinkReconnectAttempts[node.id]) lavalinkReconnectAttempts[node.id] = 0;
  const attempt = ++lavalinkReconnectAttempts[node.id];
  if (attempt > maxAttempts) {
    console.error(`[Lavalink] Node "${node.id}" failed to reconnect after ${maxAttempts} attempts.`);
    return;
  }
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 60000); // exponential backoff, max 60s
  console.log(`[Lavalink] Attempting to reconnect node "${node.id}" (attempt ${attempt}) in ${delay / 1000}s...`);
  setTimeout(async () => {
    try {
      await client.lavalink.init(client.user);
      lavalinkReconnectAttempts[node.id] = 0;
      console.log(`[Lavalink] Node "${node.id}" reconnected successfully.`);
    } catch (err) {
      console.error(`[Lavalink] Reconnect failed for node "${node.id}":`, err);
      reconnectLavalinkNode(node);
    }
  }, delay);
}

client.lavalink.on('nodeDisconnect', (node, reason) => {
  console.log(`[Lavalink] Node "${node.id}" disconnected: ${reason}`);
  reconnectLavalinkNode(node);
});

client.lavalink.on('nodeError', (node, error) => {
  console.error(`[Lavalink] Node "${node.id}" error:`, error);
  reconnectLavalinkNode(node);
});


client.lavalink.on('playerCreate', player => {
  console.log(`[Lavalink] Player created in guild ${player.guildId}`);
});

client.lavalink.on('playerDestroy', (player, reason) => console.log(`[Lavalink] Player destroyed: ${reason}`));

client.lavalink.on('trackEnd', (player, track) => {
  console.log(`[Lavalink] Track ended: ${track.info.title}`);
  // Autoplay logic removed
});


client.on('ready', async () => {
  console.log(`${client.user.tag} is ready!`);

  const rpc = new RichPresence(client)
    .setApplicationId('1366651120373600296') // You can use a custom application ID if you have one
    .setType('la3eb')
    .setName('skz_rayan23')
    .setDetails('Java | Kotlin')
    .setState('skz_rayan23')
    .setAssetsLargeImage('cb48279ea90e86fb4f71c709d3236395')
    .setAssetsLargeText('Rayan')
    .setAssetsSmallImage('cb48279ea90e86fb4f71c709d3236395')
    .setAssetsSmallText('ba33')
    .setStartTimestamp(Date.now())
    .setButtons([{ name: 'Click to folow', url: 'https://www.instagram.com/skz_rayan23/' }]);

  client.user.setActivity(rpc.toJSON());
});

// Message handler
client.on('messageCreate', async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  if (!(message.author.id === config.owner || config.adminIds.includes(message.author.id))) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(config.token);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set Lavalink client info here — very important
  client.lavalink.client = {
    id: client.user.id,
    username: client.user.username,
  };

  try {
    await client.lavalink.init(client.user);
    console.log('Lavalink initialized.');
    
    // Attach error handlers after initialization to prevent unhandled error crashes
    try {
      // Handler for LavalinkManager 'error' events
      if (client.lavalink && typeof client.lavalink.on === 'function') {
        client.lavalink.on('error', (error, node) => {
          console.error('[Lavalink][LavalinkManager] Unhandled error:', error, node?.id || 'unknown');
          if (node && node.id) reconnectLavalinkNode(node);
        });
      }
      
      // Attach error handlers to each individual node
      if (client.lavalink.NodeManager && client.lavalink.NodeManager.nodes) {
        client.lavalink.NodeManager.nodes.forEach((node) => {
          if (node && typeof node.on === 'function') {
            node.on('error', (error) => {
              console.error(`[Lavalink][node:${node.id}] Unhandled error:`, error);
              reconnectLavalinkNode(node);
            });
          }
        });
      }
      
      // Handler for NodeManager 'error' events (catches errors that aren't caught by individual nodes)
      if (client.lavalink.NodeManager && typeof client.lavalink.NodeManager.on === 'function') {
        client.lavalink.NodeManager.on('error', (error, node) => {
          console.error('[Lavalink][NodeManager] Unhandled error:', error, node?.id || 'unknown');
          if (node && node.id) reconnectLavalinkNode(node);
        });
      }
    } catch (attachErr) {
      console.error('[Lavalink] Failed to attach post-init error handlers:', attachErr);
    }
  } catch (err) {
    console.error('Lavalink failed to initialize:', err);
  }
});

// Forward raw discord events to Lavalink
client.on('raw', data => client.lavalink.sendRawData(data));

client.login(config.token);
