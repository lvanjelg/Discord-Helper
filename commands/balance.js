const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wallet = require('./helpers/wallet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your casino balance.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Whose balance to check (defaults to you).')
            .setRequired(false)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const balance = wallet.getBalance(target.id);

        const embed = new EmbedBuilder()
            .setTitle(target.username + "'s Balance")
            .setDescription('💰 **' + balance.toLocaleString() + '** coins')
            .setColor(0x9b9b9b)
            .setFooter({ text: 'New players start with ' + wallet.STARTER_BALANCE.toLocaleString() + ' coins. Spend them at /roulette and /slots!' });

        await interaction.reply({ embeds: [embed] });
    }
};
