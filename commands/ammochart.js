const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ammochart')
        .setDescription('Get links to the EFT ammo charts.'),
    async execute(interaction) {
        await interaction.reply('https://eft-ammo.com/ \nhttps://eft.monster/');
    }
};
