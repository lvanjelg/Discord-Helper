const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wallet = require('./helpers/wallet');

// Standard European roulette red numbers
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const COLOR_EMOJI = { red: '🔴', black: '⚫', green: '🟢' };

const colorOf = (n) => (n === 0 ? 'green' : RED_NUMBERS.has(n) ? 'red' : 'black');

const PAYOUT = {
    number: 36,
    red: 2,
    black: 2,
    odd: 2,
    even: 2,
    low: 2,
    high: 2,
    dozen_1: 3,
    dozen_2: 3,
    dozen_3: 3,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Bet on the roulette wheel.')
        .addIntegerOption(option => option
            .setName('bet')
            .setDescription('Amount to bet (coins).')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(option => option
            .setName('choice')
            .setDescription('What to bet on.')
            .setRequired(true)
            .addChoices(
                { name: 'Exact number', value: 'number' },
                { name: 'Red', value: 'red' },
                { name: 'Black', value: 'black' },
                { name: 'Odd', value: 'odd' },
                { name: 'Even', value: 'even' },
                { name: '1-18', value: 'low' },
                { name: '19-36', value: 'high' },
                { name: '1st dozen (1-12)', value: 'dozen_1' },
                { name: '2nd dozen (13-24)', value: 'dozen_2' },
                { name: '3rd dozen (25-36)', value: 'dozen_3' }
            )
        )
        .addIntegerOption(option => option
            .setName('number')
            .setDescription('Pick a number 0-36 (only for exact number).')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(36)
        ),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const choice = interaction.options.getString('choice');
        const chosenNumber = interaction.options.getInteger('number');

        if (choice === 'number' && chosenNumber === null) {
            return interaction.reply('You must provide a number (0-36) when betting on an exact number.');
        }

        const balance = wallet.getBalance(interaction.user.id);
        if (bet > balance) {
            return interaction.reply('You don\'t have enough coins! Your balance is **' + balance.toLocaleString() + '**.');
        }

        const result = Math.floor(Math.random() * 37); // 0-36
        const color = colorOf(result);

        let won = false;
        let betDesc;
        switch (choice) {
            case 'number': won = result === chosenNumber; betDesc = '**' + chosenNumber + '**'; break;
            case 'red': won = color === 'red'; betDesc = '**Red**'; break;
            case 'black': won = color === 'black'; betDesc = '**Black**'; break;
            case 'odd': won = result !== 0 && result % 2 === 1; betDesc = '**Odd**'; break;
            case 'even': won = result !== 0 && result % 2 === 0; betDesc = '**Even**'; break;
            case 'low': won = result >= 1 && result <= 18; betDesc = '**1-18**'; break;
            case 'high': won = result >= 19 && result <= 36; betDesc = '**19-36**'; break;
            case 'dozen_1': won = result >= 1 && result <= 12; betDesc = '**1st dozen (1-12)**'; break;
            case 'dozen_2': won = result >= 13 && result <= 24; betDesc = '**2nd dozen (13-24)**'; break;
            case 'dozen_3': won = result >= 25 && result <= 36; betDesc = '**3rd dozen (25-36)**'; break;
            default: won = false; betDesc = 'unknown'; break;
        }

        const gross = won ? bet * PAYOUT[choice] : 0;
        const newBalance = wallet.addBalance(interaction.user.id, gross - bet);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Roulette')
            .setDescription('The ball landed on ' + COLOR_EMOJI[color] + ' **' + result + '**\nYou bet on ' + betDesc)
            .addFields(
                { name: 'Bet', value: bet.toLocaleString() + ' coins', inline: true },
                { name: 'Result', value: won ? 'Won **' + (gross - bet).toLocaleString() + '**' : 'Lost **' + bet.toLocaleString() + '**', inline: true },
                { name: 'New Balance', value: newBalance.toLocaleString() + ' coins', inline: true }
            )
            .setColor(won ? 0x57f287 : 0xed4245);

        await interaction.reply({ embeds: [embed] });
    }
};
