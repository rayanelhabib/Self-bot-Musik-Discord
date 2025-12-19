# Discord Music Self Bot

A Discord self-bot for music playback using Lavalink and Discord.js.

## Features

- Music playback with queue management
- Spotify integration
- Alias customization
- Admin management
- Loop functionality
- Volume control

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Self-bot-Musik-Discord
```

2. Install dependencies:
```bash
npm install
```

3. Create a `config.json` file with your Discord token and Lavalink configuration:
```json
{
  "token": "YOUR_TOKEN_HERE",
  "prefix": "!",
  "lavalinkNodes": [
    {
      "host": "localhost",
      "port": 2333,
      "password": "youshallnotpass"
    }
  ]
}
```

4. Create a `userAliases.json` file (optional):
```json
{}
```

## Usage

Start the bot:
```bash
npm start
```

## Available Commands

- `play` - Play a song
- `pause` - Pause playback
- `resume` - Resume playback
- `skip` - Skip to next song
- `queue` - View current queue
- `nowplaying` - Show current song
- `stop` - Stop playback
- `volume` - Set volume
- `loop` - Toggle loop
- `join` - Join voice channel
- `lyrics` - Get song lyrics
- `help` - Show help

## Configuration

Edit `config.json` to:
- Set your Discord token
- Configure command aliases
- Set up Lavalink nodes

## Requirements

- Node.js
- Discord account
- Lavalink server (for music playback)

## License

ISC
