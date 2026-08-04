const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a random number between 1 and your chosen maximum.')
        .addIntegerOption(option => option
            .setName('max')
            .setDescription('The maximum number (inclusive).')
            .setRequired(true)
            .setMinValue(1)
        ),
    async execute(interaction) {
        const max = interaction.options.getInteger('max');
        const number = Math.floor(Math.random() * max) + 1;
        await interaction.reply('Your number is: ' + number);
    }
};
