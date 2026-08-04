const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wallet = require('./helpers/wallet');

// Weighted reel symbols. Higher weight = more common. Payout is the multiplier
// returned on a 3-of-a-kind spin (stake is included in the total return).
const SYMBOLS = [
    { emoji: '🍒', weight: 30, payout: 4 },
    { emoji: '🍋', weight: 25, payout: 5 },
    { emoji: '🔔', weight: 20, payout: 6 },
    { emoji: '⭐', weight: 15, payout: 8 },
    { emoji: '💰', weight: 10, payout: 12 },
    { emoji: '🎰', weight: 8, payout: 15 },
    { emoji: '7️⃣', weight: 6, payout: 25 },
    { emoji: '💎', weight: 3, payout: 50 },
];
const PAIR_MULTIPLIER = 1.5;

function spin() {
    const total = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let roll = Math.random() * total;
    for (const s of SYMBOLS) {
        roll -= s.weight;
        if (roll <= 0) return s;
    }
    return SYMBOLS[SYMBOLS.length - 1];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Spin the slot machine.')
        .addIntegerOption(option => option
            .setName('bet')
            .setDescription('Amount to bet (coins).')
            .setRequired(true)
            .setMinValue(1)
        ),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const balance = wallet.getBalance(interaction.user.id);
        if (bet > balance) {
            return interaction.reply('You don\'t have enough coins! Your balance is **' + balance.toLocaleString() + '**.');
        }

        const reels = [spin(), spin(), spin()];

        let multiplier = 0;
        if (reels[0].emoji === reels[1].emoji && reels[1].emoji === reels[2].emoji) {
            multiplier = reels[0].payout; // three of a kind
        } else if (reels[0].emoji === reels[1].emoji || reels[1].emoji === reels[2].emoji || reels[0].emoji === reels[2].emoji) {
            multiplier = PAIR_MULTIPLIER; // any pair
        }

        const gross = Math.round(bet * multiplier);
        const newBalance = wallet.addBalance(interaction.user.id, gross - bet);
        const won = gross > 0;

        const embed = new EmbedBuilder()
            .setTitle('🎰 Slots')
            .setDescription(reels.map(r => r.emoji).join('  |  '))
            .addFields(
                { name: 'Bet', value: bet.toLocaleString() + ' coins', inline: true },
                { name: 'Result', value: won ? 'Won **' + (gross - bet).toLocaleString() + '**' : 'Lost **' + bet.toLocaleString() + '**', inline: true },
                { name: 'New Balance', value: newBalance.toLocaleString() + ' coins', inline: true }
            )
            .setColor(won ? 0x57f287 : 0xed4245);

        await interaction.reply({ embeds: [embed] });
    }
};
