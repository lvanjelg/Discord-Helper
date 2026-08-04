const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with all the bot commands.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Command List')
            .setDescription('Here are all my slash commands:')
            .setColor(0x9b9b9b)
            .addFields(
                { name: '/ammochart', value: 'Links to the EFT ammo charts', inline: false },
                { name: '/maps', value: 'Links to EFT map websites', inline: false },
                { name: '/maplookup', value: 'Get the wiki page for a map', inline: false },
                { name: '/itemlookup', value: 'Look up item info from tarkov.dev (populated list)', inline: false },
                { name: '/questlookup', value: 'Look up quest info from tarkov.dev (populated list)', inline: false },
                { name: '/hideoutinfo', value: 'Hideout required items and flowchart', inline: false },
                { name: '/coinflip', value: 'Flip a coin - heads or tails', inline: false },
                { name: '/random', value: 'Get a random number from 1 to your max', inline: false },
                { name: '/r6op', value: 'Get a random Rainbow Six operator for attack or defense', inline: false },
                { name: '/wheelspin', value: 'Pick a random option from the ones you provide', inline: false },
                { name: '/csroulette', value: 'Get a Counter Strike roulette strategy', inline: false },
                { name: '/balance', value: 'Check your casino balance', inline: false },
                { name: '/daily', value: 'Claim your daily casino bonus', inline: false },
                { name: '/roulette', value: 'Bet on the roulette wheel', inline: false },
                { name: '/slots', value: 'Spin the slot machine', inline: false }
            );
        await interaction.reply({ embeds: [embed] });
    }
};
