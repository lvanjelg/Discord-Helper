const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin - heads or tails.'),
    async execute(interaction) {
        const coin = Math.random() < 0.5 ? 'heads' : 'tails';
        await interaction.reply('The coin is ' + coin + '.');
    }
};
