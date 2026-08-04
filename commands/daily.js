const { SlashCommandBuilder } = require('discord.js');
const wallet = require('./helpers/wallet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily casino bonus.'),
    async execute(interaction) {
        const claimed = wallet.claimDaily(interaction.user.id);
        if (claimed) {
            await interaction.reply('✅ You claimed your daily bonus of **' + wallet.DAILY_AMOUNT.toLocaleString() + ' coins**! New balance: **' + wallet.getBalance(interaction.user.id).toLocaleString() + '**.');
        } else {
            await interaction.reply('❌ You already claimed your daily bonus today. Come back tomorrow!');
        }
    }
};
