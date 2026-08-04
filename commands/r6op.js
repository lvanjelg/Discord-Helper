const { SlashCommandBuilder } = require('discord.js');

const ATTACKERS = ['Striker','Deimos','Ram','Brava','Grim','Sense','Osa','Flores','Zero','Ace','Iana','Kali','Amaru','Nokk','Gridlock','Nomad','Maverick','Lion','Finka','Dokkaebi','Zofia','Ying','Jackal','Hibana','Capitao','Blackbeard','Buck','Sledge','Thatcher','Ash','Thermite','Montagne','Twitch','Blitz','IQ','Fuze','Glaz'];
const DEFENDERS = ['Sentry','Skopos','Tubarao','Fenrir','Solis','Azami','Thorn','Thunderbird','Aruni','Melusi','Oryx','Wamai','Goyo','Warden','Mozzie','Kaid','Clash','Maestro','Alibi','Vigil','Ela','Lesion','Mira','Echo','Caveira','Valkyrie','Frost','Mute','Smoke','Castle','Pulse','Doc','Rook','Jager','Bandit','Tachanka','Kapkan'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r6op')
        .setDescription('Get a random Rainbow Six Siege operator.')
        .addStringOption(option => option
            .setName('side')
            .setDescription('Which side are you playing?')
            .setRequired(true)
            .addChoices(
                { name: 'Attack', value: 'attack' },
                { name: 'Defense', value: 'defense' }
            )
        ),
    async execute(interaction) {
        const side = interaction.options.getString('side');
        const pool = side === 'attack' ? ATTACKERS : DEFENDERS;
        const op = pool[Math.floor(Math.random() * pool.length)];
        await interaction.reply('You should play ' + op);
    }
};
