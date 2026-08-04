const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const tarkov = require('./helpers/tarkov');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('itemlookup')
        .setDescription('Look up item information from tarkov.dev.')
        .addStringOption(option => option
            .setName('item')
            .setDescription('Item to look up (pick from the populated list).')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const names = await tarkov.getItemNames();
        return tarkov.filterNames(names, focused);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const itemName = interaction.options.getString('item');

        try {
            const item = await tarkov.getItem(itemName);
            if (!item) {
                return interaction.editReply('No item found for "' + itemName + '". Try picking from the list.');
            }

            // Fetch craft / barter / hideout usage data for this item
            const [crafts, barters, stations] = await Promise.all([
                tarkov.getCrafts(),
                tarkov.getBarters(),
                tarkov.getHideoutStations(),
            ]);

            const usesItem = (list) => (list || []).some(r => r.item && r.item.id === item.id);
            const itemCrafts = crafts.filter(c => usesItem(c.requiredItems) || usesItem(c.rewardItems));
            const itemBarters = barters.filter(b => usesItem(b.requiredItems) || usesItem(b.rewardItems));
            const itemHideout = stations.filter(st => (st.levels || []).some(lvl => usesItem(lvl.itemRequirements)));

            // Vendor sell prices (excluding the flea market)
            const sellFor = (item.sellFor || []).filter(s => s && s.vendor && s.vendor.name !== 'Flea Market' && s.priceRUB);
            const bestVendor = sellFor.length ? sellFor.reduce((max, s) => s.priceRUB > max.priceRUB ? s : max) : null;

            const embed = new EmbedBuilder()
                .setTitle(item.shortName && item.shortName !== item.name ? item.name + ' (' + item.shortName + ')' : item.name)
                .setColor(0x9b9b9b);

            if (item.wikiLink) embed.setURL(item.wikiLink);
            if (item.inspectImageLink) embed.setThumbnail(item.inspectImageLink);
            if (item.description) embed.setDescription(item.description.slice(0, 1024));

            embed.addFields(
                { name: '24h Average Flea Price', value: item.avg24hPrice ? item.avg24hPrice.toLocaleString() + ' ₽' : 'Not available from flea market', inline: true },
                { name: '24h Lowest Flea Price', value: item.low24hPrice ? item.low24hPrice.toLocaleString() + ' ₽' : 'Not available from flea market', inline: true },
                { name: 'Best Vendor Sell', value: bestVendor ? bestVendor.priceRUB.toLocaleString() + ' ₽ (' + bestVendor.vendor.name + ')' : 'Not available', inline: true }
            );

            if (sellFor.length > 0) {
                embed.addFields({
                    name: 'Vendor Sell Prices',
                    value: sellFor
                        .map(s => s.vendor.name + ': ' + s.priceRUB.toLocaleString() + ' ₽')
                        .join('\n')
                        .slice(0, 1024),
                    inline: false,
                });
            }

            const fmtReq = (r) => (r.count || 1) + 'x ' + (r.item ? r.item.name : '?');

            if (itemCrafts.length > 0) {
                const lines = itemCrafts.slice(0, 6).map(c =>
                    (c.station ? c.station.name : 'Hideout') + ' Lv' + (c.level || 1) + ' — ' +
                    (c.requiredItems || []).map(fmtReq).join(', ') + ' → ' +
                    (c.rewardItems || []).map(fmtReq).join(', ')
                );
                embed.addFields({ name: 'Crafts (' + itemCrafts.length + ')', value: lines.join('\n').slice(0, 1024), inline: false });
            }

            if (itemBarters.length > 0) {
                const lines = itemBarters.slice(0, 6).map(b =>
                    (b.trader ? b.trader.name : 'Trader') + ' Lv' + (b.level || 1) + ' — ' +
                    (b.requiredItems || []).map(fmtReq).join(', ') + ' → ' +
                    (b.rewardItems || []).map(fmtReq).join(', ')
                );
                embed.addFields({ name: 'Barters (' + itemBarters.length + ')', value: lines.join('\n').slice(0, 1024), inline: false });
            }

            if (itemHideout.length > 0) {
                const lines = [];
                for (const st of itemHideout) {
                    for (const lvl of st.levels || []) {
                        const req = (lvl.itemRequirements || []).find(r => r.item && r.item.id === item.id);
                        if (req) {
                            lines.push(st.name + ' Lv' + (lvl.level || 1) + ' — requires ' + (req.count || 1) + 'x ' + (req.item ? req.item.name : '?'));
                        }
                        if (lines.length >= 8) break;
                    }
                    if (lines.length >= 8) break;
                }
                embed.addFields({ name: 'Hideout', value: lines.join('\n').slice(0, 1024), inline: false });
            }

            embed.setFooter({ text: 'Data from tarkov.dev' });
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('itemlookup error:', error.message);
            await interaction.editReply('Error looking up item: ' + error.message);
        }
    }
};
