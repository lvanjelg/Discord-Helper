const axios = require('axios');
const time = new Date();
const currentTime = time.toLocaleTimeString();
const currentDate = time.toLocaleDateString();
require("dotenv").config();
const https = require('https');
const chokidar = require('chokidar');
const fs = require('fs');
const {Client,GatewayIntentBits, Attachment, EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const { hostname } = require("os");
const { exec } = require('child_process');
const client = new Client({intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers]});

const PREFIX = "!";

client.on('ready', () => {
    console.log(client.user.username + ' has logged in.');
});



client.on('messageCreate', (message) => {
    //console.log('[' + message.author.username + ']:' + message.content);
    if(message.content.startsWith(PREFIX)){
        const [CMD_NAME, ...args] = message.content.toLowerCase().trim().substring(PREFIX.length).split(/\s+/);
        // console.log(CMD_NAME);
        // console.log(args);
        if(CMD_NAME === 'ammochart'){
            message.channel.send("https://eft-ammo.com/ \nhttps://eft.monster/");
        }else if(CMD_NAME === 'maps'){
            message.channel.send("https://mapgenie.io/tarkov \nhttps://www.eftmaps.net/")
        }else if(CMD_NAME === 'maplookup'){
            if(args[0] === "customs"){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Customs");
            }else if(args[0] === 'factory'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Factory")
            }else if(args[0] === 'interchange'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Interchange");
            }else if(args[0] === 'lighthouse'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Lighthouse");
            }else if(args[0] === 'reserve'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Reserve")
            }else if(args[0] === 'shoreline'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Shoreline");
            }else if(args[0] === 'streets'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Streets_of_Tarkov");
            }else if(args[0] === 'labs'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/The_Lab");
            }else if(args[0] === 'woods'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Woods");
            }else if(args[0] === 'ground zero'){
                message.channel.send("https://escapefromtarkov.fandom.com/wiki/Ground_Zero");
            }else{
                 message.channel.send("Unknown map")
            }
        }else if(CMD_NAME === 'itemlookup'){
            const itemName = message.content.slice(11);
            tarkovItemLookup(itemName);
            async function tarkovItemLookup(itemName){
                try {
                    const response = await axios.post(`https://api.tarkov.dev/graphql`,{
                        headers:{
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        query:`{
                            items(name: "${itemName}"){
                                wikiLink
                                name
                                avg24hPrice
                                low24hPrice
                                    sellFor{
                                currency
                                vendor{
                                    name
                                }
                                priceRUB
                                }
                                inspectImageLink
                                description
                            }
                        }`,
                    });
                    const itemData = response.data.data.items[0];
                    const highPrice = itemData.sellFor.filter(sell => sell.vendor.name !== "Flea Market").reduce((max,sell) => sell.priceRUB > max.priceRUB ? sell : max);
                    //message.channel.send(`Item Data for ${itemName}: \nWiki Link: ${itemData.wikiLink}\nAverage 24 hour flea market price: ${itemData.avg24hPrice || "Not available from flea market"}\nLowest 24 hour flea market price: ${itemData.low24hPrice || "Not available from flea market"}\nHighest sell to vendor price: ${highPrice.priceRUB} RUB from ${highPrice.vendor.name}`);
                    const itemEmbed = new EmbedBuilder()
                        .setTitle(`Item information for ${itemData.name}`)
                        .setURL(`${itemData.wikiLink}`)
                        .setThumbnail(`${itemData.inspectImageLink}`)
                        .addFields(
                            {name: '24 hour average flea market price', value: `${itemData.avg24hPrice || "Not available from flea market"}`},
                            {name: '24 hour lowest flea market price', value: `${itemData.low24hPrice || "Not available from flea market"}`},
                            {name: 'Highest sell to vendor price', value: `${highPrice.priceRUB} RUB from ${highPrice.vendor.name}`},
                        );
                    message.channel.send({embeds: [itemEmbed]});
                  } catch (error) {
                    message.channel.send('Error fetching item data. Try again and make sure you are searching for an existing item.');
                    console.log('[',currentDate,':',currentTime,'] - !itemlookup - Error fetching item data -',error);
                    console.log(message.author.username + " - " + message.content);
                  }
            }
        }else if(CMD_NAME === 'questlookup'){
            const questName = message.content.split(' ')[1];
            tarkovQuestLookup(questName);
            async function tarkovQuestLookup(questName){
                try{
                    const response = await axios.post(`https://api.tarkov.dev/graphql`,{
                        headers:{
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        query:`{
                            tasks{
                                name
                                kappaRequired
                                experience
                                minPlayerLevel
                                lightkeeperRequired
                                objectives {
                                    id
                                }
                                wikiLink
                                finishRewards {
                                    items {
                                        count
                                        item {
                                            name
                                        }
                                }   
                                offerUnlock {
                                    item {
                                    name
                                    }
                                }
                                skillLevelReward {
                                    name
                                }
                                traderStanding {
                                    standing
                                }
                                }
                                trader {
                                name
                                }
                            }
                        }`,
                    });
                    const questData = response.data.data.tasks[0]
                    const questEmbed = new EmbedBuilder()
                        .setTitle(`Quest information for ${questName}`)
                        .setURL(`${questData.wikiLink}`)
                        .setThumbnail(questData.wikiLink);
                    message.channel.send({embeds:[questEmbed]});
                    //message.channel.send(`Quest Data for ${questName}: \nWiki Link: ${questData.wikiLink}`);
                } catch(error){
                    message.channel.send('Error fetching quest data. Try again and make sure you are searching for an existing quest.');
                    console.log('[',currentDate,':',currentTime,'] - !questlookup - Error fetching quest data -',error);
                    console.log(message.author.username + " - " + message.content + "\n");
                }    
            }
        }else if(CMD_NAME === 'hideoutinfo'){
            message.channel.send("Here are the items required for hideout.");
            message.channel.send({files:[{attachment: 'hideout_required_items.webp'}]});
            message.channel.send({files:[{attachment: 'Hideout_flowchart.webp'}]});
            message.channel.send("https://escapefromtarkov.fandom.com/wiki/Hideout");
        }else if(CMD_NAME === 'help'){
            message.channel.send("Here are my commands:\n!ammochart, !maps, !maplookup, !wikilookup, and !pricelookup.\n\nAmmochart and map commands provide links to the ammochart and map websites.\n\nThe wiki lookup command should be followed by the item, quest, or map and will send the corresponding wiki page.\n\nThe price lookup command will send a link to the tarkov market website for the item.");
        }else if(CMD_NAME === 'coinflip'){
            var coin = Math.floor(Math.random() * 2);
            if(coin === 1){
                message.channel.send("The coin is heads.");
            }else{
                message.channel.send("The coin is tails.");
            }
        }else if(CMD_NAME === 'random'){
            var number = Math.floor(Math.random() * args[0]) + 1;
            message.channel.send("Your number is: " + number);
        }else if(CMD_NAME === 'r6op'){
            const attackers = ['Striker','Deimos','Ram','Brava','Grim','Sense','Osa','Flores','Zero','Ace','Iana','Kali','Amaru','Nokk','Gridlock','Nomad','Maverick','Lion','Finka','Dokkaebi','Zofia','Ying','Jackal','Hibana','Capitao','Blackbeard','Buck','Sledge','Thatcher','Ash','Thermite','Montagne','Twitch','Blitz','IQ','Fuze','Glaz'];
            const defenders = ['Sentry','Skopos','Tubarao','Fenrir','Solis','Azami','Thorn','Thunderbird','Aruni','Melusi','Oryx','Wamai','Goyo','Warden','Mozzie','Kaid','Clash','Maestro','Alibi','Vigil','Ela','Lesion','Mira','Echo','Caveira','Valkyrie','Frost','Mute','Smoke','Castle','Pulse','Doc','Rook','Jager','Bandit','Tachanka','Kapkan'];
            if(args[0] === 'attack'){
                var op = Math.floor(Math.random() * attackers.length);
                message.channel.send("You should play " + attackers[op]);
            }else if(args[0] === 'defense'){
                var op = Math.floor(Math.random() * defenders.length);
                message.channel.send("You should play " + defenders[op]);
            }else{
                message.channel.send("Try this command again but include 'attack' or 'defense'.");
            }
        }else if(CMD_NAME === 'wheelspin'){
            var i = Math.floor(Math.random() * args.length);
            message.channel.send(args[i]);
        }
    }
});



client.login(process.env.DISCORDJS_BOT_TOKEN);

/* Notes
Add images to ammo chart
use https://tarkov.dev/api/
csgo roulette
joke hr department thing?
gambling!
pretty up messages with embeds
change commands from prefix to slash commands
*/