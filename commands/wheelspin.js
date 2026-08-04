const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wheelspin')
        .setDescription('Pick a random option from the ones you provide.')
        .addStringOption(option => option
            .setName('choices')
            .setDescription('Options separated by commas, e.g. red, blue, green')
            .setRequired(true)
        ),
    async execute(interaction) {
        const raw = interaction.options.getString('choices');
        const choices = raw.split(',').map(c => c.trim()).filter(Boolean);
        if (choices.length === 0) {
            return interaction.reply('Please provide at least one choice.');
        }
        const pick = choices[Math.floor(Math.random() * choices.length)];
        await interaction.reply(pick);
    }
};
