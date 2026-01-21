require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
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
});

module.exports = client;
