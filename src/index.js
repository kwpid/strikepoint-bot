require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const http = require('http');

// Simple HTTP server to keep Render happy
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is alive!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const { loadEvents } = require('./handlers/eventHandler');
const { loadCommands } = require('./handlers/commandHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();
client.slashCommands = new Collection();

client.login(process.env.DISCORD_TOKEN).then(() => {
    loadEvents(client);
    loadCommands(client);
}).catch(err => {
    console.error("Failed to login to Discord:", err);
});

module.exports = client;
