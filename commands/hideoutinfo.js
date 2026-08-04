const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hideoutinfo')
        .setDescription('Get the items required for the hideout.'),
    async execute(interaction) {
        await interaction.reply({
            content: 'Here are the items required for hideout.\nhttps://escapefromtarkov.fandom.com/wiki/Hideout',
            files: [
                { attachment: path.join(__dirname, '..', 'hideout_required_items.webp') },
                { attachment: path.join(__dirname, '..', 'Hideout_flowchart.webp') }
            ]
        });
    }
};
