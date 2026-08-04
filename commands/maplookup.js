const { SlashCommandBuilder } = require('discord.js');

const MAP_LINKS = {
    customs: 'https://escapefromtarkov.fandom.com/wiki/Customs',
    factory: 'https://escapefromtarkov.fandom.com/wiki/Factory',
    interchange: 'https://escapefromtarkov.fandom.com/wiki/Interchange',
    lighthouse: 'https://escapefromtarkov.fandom.com/wiki/Lighthouse',
    reserve: 'https://escapefromtarkov.fandom.com/wiki/Reserve',
    shoreline: 'https://escapefromtarkov.fandom.com/wiki/Shoreline',
    streets: 'https://escapefromtarkov.fandom.com/wiki/Streets_of_Tarkov',
    labs: 'https://escapefromtarkov.fandom.com/wiki/The_Lab',
    woods: 'https://escapefromtarkov.fandom.com/wiki/Woods',
    'ground zero': 'https://escapefromtarkov.fandom.com/wiki/Ground_Zero',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maplookup')
        .setDescription('Get the wiki page for a map.')
        .addStringOption(option => option
            .setName('map')
            .setDescription('Which map to look up.')
            .setRequired(true)
            .addChoices(
                { name: 'Customs', value: 'customs' },
                { name: 'Factory', value: 'factory' },
                { name: 'Interchange', value: 'interchange' },
                { name: 'Lighthouse', value: 'lighthouse' },
                { name: 'Reserve', value: 'reserve' },
                { name: 'Shoreline', value: 'shoreline' },
                { name: 'Streets', value: 'streets' },
                { name: 'Labs', value: 'labs' },
                { name: 'Woods', value: 'woods' },
                { name: 'Ground Zero', value: 'ground zero' }
            )
        ),
    async execute(interaction) {
        const map = interaction.options.getString('map');
        const link = MAP_LINKS[map];
        if (!link) return interaction.reply('Unknown map.');
        await interaction.reply(link);
    }
};
