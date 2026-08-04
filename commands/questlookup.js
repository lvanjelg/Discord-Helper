const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const tarkov = require('./helpers/tarkov');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('questlookup')
        .setDescription('Look up quest information from tarkov.dev.')
        .addStringOption(option => option
            .setName('quest')
            .setDescription('Quest to look up (pick from the populated list).')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const names = await tarkov.getTaskNames();
        return tarkov.filterNames(names, focused);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const questName = interaction.options.getString('quest');

        try {
            const task = await tarkov.getTask(questName);
            if (!task) {
                return interaction.editReply('No quest found for "' + questName + '". Try picking from the list.');
            }

            const finish = task.finishRewards || {};
            const rewardItems = (finish.items || []).map(i => (i.count || 1) + 'x ' + (i.item ? i.item.name : '?')).join('\n');
            const skillRewards = (finish.skillLevelReward || []).map(s => s.name).join('\n');
            const standing = (finish.traderStanding || []).map(s => '+ ' + (s.standing || 0) + ' standing').join('\n');

            const rewardLines = [];
            if (rewardItems) rewardLines.push('**Items:**\n' + rewardItems);
            if (skillRewards) rewardLines.push('**Skills:**\n' + skillRewards);
            if (standing) rewardLines.push('**Trader standing:**\n' + standing);

            const embed = new EmbedBuilder()
                .setTitle(task.name)
                .setColor(0x9b9b9b);

            if (task.wikiLink) embed.setURL(task.wikiLink);
            if (task.taskImageLink) {
                embed.setThumbnail(task.taskImageLink);
            } else if (task.trader && task.trader.imageLink) {
                embed.setThumbnail(task.trader.imageLink);
            }

            embed.addFields(
                { name: 'Trader', value: task.trader ? task.trader.name : 'Unknown', inline: true },
                { name: 'Experience', value: String(task.experience || 0), inline: true },
                { name: 'Min Player Level', value: String(task.minPlayerLevel || 0), inline: true },
                { name: 'Kappa Required', value: task.kappaRequired ? 'Yes' : 'No', inline: true },
                { name: 'Lightkeeper Required', value: task.lightkeeperRequired ? 'Yes' : 'No', inline: true },
                { name: 'Rewards', value: rewardLines.length ? rewardLines.join('\n\n').slice(0, 1024) : 'None', inline: false }
            );

            embed.setFooter({ text: 'Data from tarkov.dev' });
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('questlookup error:', error.message);
            await interaction.editReply('Error looking up quest: ' + error.message);
        }
    }
};
