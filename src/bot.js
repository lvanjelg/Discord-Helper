const axios = require('axios');
const time = new Date();
const currentTime = time.toLocaleTimeString();
const currentDate = time.toLocaleDateString();
require("dotenv").config();
const https = require('https');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const {Client,GatewayIntentBits, Attachment, EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const { hostname } = require("os");
const { exec } = require('child_process');
const client = new Client({intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers]});

// Load slash commands from the ./commands folder
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(__dirname, '..', 'commands', file));
    commands.set(command.data.name, command);
}

// Shared tarkov.dev helper (autocomplete caches + lookups)
const tarkov = require(path.join(__dirname, '..', 'commands', 'helpers', 'tarkov'));

client.on('ready', () => {
    console.log(client.user.username + ' has logged in.');
    // Preload tarkov.dev item/quest names so autocomplete is instant
    tarkov.preload();
});

client.on('interactionCreate', async (interaction) => {
    // Handle autocomplete requests (populated option lists)
    if (interaction.isAutocomplete()) {
        const command = commands.get(interaction.commandName);
        if (!command || typeof command.autocomplete !== 'function') return;

        try {
            const options = await command.autocomplete(interaction);
            await interaction.respond(options.slice(0, 25));
        } catch (error) {
            console.error('Autocomplete error for /' + interaction.commandName + ':', error.message);
            await interaction.respond([]).catch(() => {});
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command ' + interaction.commandName + ':', error);
        const errorMsg = { content: 'There was an error executing this command.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMsg).catch(() => {});
        } else {
            await interaction.reply(errorMsg).catch(() => {});
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

/* Notes
Add images to ammo chart
use https://tarkov.dev/api/
csgo roulette
joke hr department thing?
gambling!
pretty up messages with embeds
change commands from prefix to slash commands
*/