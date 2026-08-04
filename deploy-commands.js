const { REST, Routes } = require('discord.js');
const { clientId, guildId} = require('./config.json'); // Make sure to add these to a config file
const fs = require('fs');
require("dotenv").config();
const token = process.env.DISCORDJS_BOT_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Refreshing application (/) commands...');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), // Use applicationCommands(clientId) for global commands
            { body: commands}
        );

        console.log('Successfully reloaded commands.');
    } catch (error) {
        console.error(error);
    }
})();
