const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const tarkov = require('./helpers/tarkov');

const typeLabel = (type) => {
    const labels = {
        findItem: 'Find', findQuestItem: 'Find', giveItem: 'Hand over', giveQuestItem: 'Hand over',
        plantItem: 'Plant', plantQuestItem: 'Plant', useItem: 'Use', mark: 'Mark', sellItem: 'Sell',
        buildWeapon: 'Build weapon with', shoot: 'Kill with', visit: 'Visit', extract: 'Extract',
        experience: 'Gain experience', skill: 'Level skill', traderLevel: 'Reach trader level',
    };
    return labels[type] || type;
};

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
                { name: 'Min Player Level', value: String(task.minPlayerLevel || 0), inline: true },
                { name: 'Experience', value: String(task.experience || 0), inline: true },
                { name: 'Kappa Required', value: task.kappaRequired ? 'Yes' : 'No', inline: true },
                { name: 'Lightkeeper Required', value: task.lightkeeperRequired ? 'Yes' : 'No', inline: true },
                { name: 'Restartable', value: task.restartable ? 'Yes' : 'No', inline: true }
            );

            // Requirements to unlock (previous quests + trader loyalty)
            const reqLines = [];
            const prevLinks = task.previousTasks.map(t => t.wikiLink ? '[' + t.name + '](' + t.wikiLink + ')' : t.name);
            if (prevLinks.length) reqLines.push('**Previous quests:**\n' + prevLinks.join('\n'));
            for (const r of task.traderRequirements) {
                reqLines.push('**' + r.traderName + '** Lv' + (r.level || 0) + ' (' + r.type + ')');
            }
            if (task.minPlayerLevel > 1) reqLines.push('**Player level** ' + task.minPlayerLevel + '+');
            if (reqLines.length) {
                embed.addFields({ name: 'Requirements', value: reqLines.join('\n').slice(0, 1024), inline: false });
            }

            // What the quest needs (objectives)
            const objLines = task.objectives.slice(0, 15).map(o => {
                let line = '• ' + (o.description || typeLabel(o.type) + (o.items.length ? ': ' + o.items.join(', ') : ''));
                if (typeof o.count === 'number' && o.count > 0) line += ' (x' + o.count + ')';
                if (o.optional) line += ' *(optional)*';
                return line;
            });
            if (objLines.length) {
                embed.addFields({ name: 'Objectives', value: objLines.join('\n').slice(0, 1024), inline: false });
            }

            // Rewards
            const rewardLines = task.rewards.slice(0, 15);
            if (rewardLines.length) {
                embed.addFields({ name: 'Rewards', value: '• ' + rewardLines.join('\n• ').slice(0, 1024), inline: false });
            }

            // Continuation
            const nextLinks = task.nextTasks.map(t => t.wikiLink ? '[' + t.name + '](' + t.wikiLink + ')' : t.name);
            if (nextLinks.length) {
                embed.addFields({ name: 'Next Quests', value: nextLinks.slice(0, 10).join('\n').slice(0, 1024), inline: false });
            }

            embed.setFooter({ text: 'Data from tarkov.dev' });
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('questlookup error:', error.message);
            await interaction.editReply('Error looking up quest: ' + error.message);
        }
    }
};
