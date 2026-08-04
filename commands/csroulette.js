const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('csroulette')
        .setDescription('Gives players a Counter Strike roulette strategy.')
        .addStringOption(option => option
            .setName('map')
            .setDescription('Which map to get a strat for. Type Reg/T/CT to get a general strategy.')
            .setRequired(true)
            .addChoices(
                {name: 'Mirage', value: 'mirage'},
                {name: 'Inferno', value: 'inferno'},
                {name: 'Nuke', value: 'nuke'},
                {name: 'Overpass', value: 'overpass'},
                {name: 'Train', value: 'train'},
                {name: 'Dust 2', value: 'dust2'},
                {name: 'Regular', value: 'reg'},
                {name: 'CT', value: 'ct'},
                {name: 'T', value: 't'}
            )
        )
        .addStringOption(option => option
            .setName('side')
            .setDescription('Which side are you on?')
            .setRequired(false)
            .addChoices(
                {name: 'CT', value: 'ct'},
                {name: 'T', value: 't'}
            )
        )
        ,
    async execute(interaction) {
        await interaction.deferReply();

        const strats = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cs_strats.json')));
        const map = interaction.options.getString('map');
        const side = interaction.options.getString('side');

        // General strategies: reg / ct / t (no side needed)
        if (map === 'reg' || map === 'ct' || map === 't') {
            const list = strats[map];
            const strat = list[Math.floor(Math.random() * list.length)];
            return interaction.editReply('Strategy Name: ' + strat.name + '\nStrategy Description: ' + strat.desc);
        }

        // Map-specific strategies: side is required
        if (side !== 't' && side !== 'ct') {
            return interaction.editReply('Please specify a side (CT or T) for the ' + map + ' strategy.');
        }

        if (!strats[map] || !strats[map][side]) {
            return interaction.editReply('No strategies found for ' + map + ' on ' + side.toUpperCase() + '.');
        }

        const list = strats[map][side];
        const strat = list[Math.floor(Math.random() * list.length)];
        await interaction.editReply('Strategy Name: ' + strat.name + '\nStrategy Description: ' + strat.desc);
    }
};