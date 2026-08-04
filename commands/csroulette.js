const {Client, EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const fs = require('fs');

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
        console.log("start");
        await interaction.deferReply();
        const strats = JSON.parse(fs.readFileSync('cs_strats.json'));
        const map = interaction.option.getString('map');
        const side = interaction.options.getString('side');
        let stratName;
        let stratDesc;
        let numStrats;
        let rand;
        switch(map){
            case 'mirage':
                if(side === 't'){
                    numStrats = strats.mirage.t.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.mirage.t[rand].name;
                    stratDesc = strats.mirage.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    numStrats = strats.mirage.ct.length;
                    stratName = strats.mirage.ct[rand].name;
                    stratDesc = strats.mirage.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'inferno':
                if(side === 't'){
                    numStrats = strats.inferno.t.length; 
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.inferno.t[rand].name;
                    stratDesc = strats.inferno.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    numStrats = strats.inferno.ct.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.inferno.ct[rand].name;
                    stratDesc = strats.inferno.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'nuke':
                if(side === 't'){
                    numStrats = strats.nuke.t.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.nuke.t[rand].name;
                    stratDesc = strats.nuke.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    numStrats = strats.nuke.ct.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.nuke.ct[rand].name;
                    stratDesc = strats.nuke.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'overpass':
                if(side === 't'){
                    numStrats = strats.overpass.t.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.overpass.t[rand].name;
                    stratDesc = strats.overpass.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    numStrats = strats.overpass.ct.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.overpass.ct[rand].name;
                    stratDesc = strats.overpass.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'train':
                if(side === 't'){
                    numStrats = strats.train.t.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.train.t[rand].name;
                    stratDesc = strats.train.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    numStrats = strats.train.ct.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.train.ct[rand].name;
                    stratDesc = strats.train.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'dust2':
                if(side === 't'){
                    numStrats = strats.dust2.t.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.dust2.t[rand].name;
                    stratDesc = strats.dust2.t[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else if(side === 'ct'){
                    numStrats = strats.dust2.ct.length;
                    rand = Math.floor(Math.random(numStrats)*numStrats);
                    stratName = strats.dust2.ct[rand].name;
                    stratDesc = strats.dust2.ct[rand].desc;
                    await interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                }else{
                    await interaction.reply('Unknown input, please try again with correct input.');
                }
            case 'reg':
                numStrats = strats.reg.length;
                rand = Math.floor(Math.random(numStrats)*numStrats);
                stratName = strats.reg[rand].name;
                stratDesc = strats.reg[rand].desc;
                interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
            case 'CT':
                numStrats = strats.ct.length;
                rand = Math.floor(Math.random(numStrats)*numStrats);
                stratName = strats.ct[rand].name;
                stratDesc = strats.t[rand].desc;
                interaction.deferReply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
                console.log("Strategy Sent");
            case 't':
                numStrats = strats.t.length;
                rand = Math.floor(Math.random(numStrats)*numStrats);
                stratName = strats.t[rand].name;
                stratDesc = strats.t[rand].desc;
                interaction.reply('Strategy Name: ' + stratName + '\n Strategy Description: ' + stratDesc);
        }
        if(map === 'CT'){
            console.log("caps");
        }
        if(map === 'ct'){
            console.log("lower");
        }
    }
};