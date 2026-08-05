const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maps')
        .setDescription('Get links to EFT map websites.'),
    async execute(interaction) {
        await interaction.reply('https://mapgenie.io/tarkov');
    }
};
