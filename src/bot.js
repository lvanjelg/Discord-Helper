require("dotenv").config();

const chokidar = require('chokidar');
const fs = require('fs');
const googleIt = require('google-it');
const {Client,GatewayIntentBits} = require('discord.js');
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
            }else{
                 message.channel.send("Unknown map.")
            }
        }else if(CMD_NAME === 'wikilookup'){
            var runT = 0;
            googleIt({'limit': 1,'only-urls': true,'query': args + 'tarkov','include-sites':'https://escapefromtarkov.fandom.com/','output':'res.json'}).then(results =>{}).catch(e =>{console.log(e)});
            fs.watch("./res.json",(eventType,filename)=>{
                fs.readFile("./res.json",'utf-8',(err,jsonString)=>{
                    if(err){
                        console.log("File read failed:",err);
                        return;
                    }
                    var temp = jsonString.split(" ");
                    var ret;
                    for(var i = 0; i < temp.length; i++){
                        if(temp[i].length > 7)
                            ret = temp[i].trim();
                    }if(runT>0){
                        return;
                    }
                    message.channel.send(ret.replace(/["]+/g, ''));
                    runT++;
                });    
            });
        }else if(CMD_NAME === 'pricelookup'){
            //Make bot send price in message
            var runT = 0
            googleIt({'limit': 1,'only-urls': true,'query': args + 'price tarkov','include-sites':'https://tarkov-market.com/','output':'res.json'}).then(results =>{}).catch(e =>{console.log(e)});
            fs.watch("./res.json",(eventType,filename)=>{
                fs.readFile("./res.json",'utf-8',(err,jsonString)=>{
                    if(err){
                        console.log("File read failed:",err);
                        return;
                    }
                    var temp = jsonString.split(" ");
                    var ret;
                    for(var i = 0; i < temp.length; i++){
                        if(temp[i].length > 7)
                            ret = temp[i].trim();
                    }
                    if(runT > 0){
                        return;
                    }
                    message.channel.send(ret.replace(/["]+/g, ''));
                    runT++;
                });    
            });
        }else if(CMD_NAME === 'help'){
            message.channel.send("Here are my commands:\n!ammochart, !maps, !maplookup, !wikilookup, and !pricelookup.\n\nAmmochart and map commands provide links to the ammochart and map websites.\n\nThe wiki lookup command should be followed by the item, quest, or map and will send the corresponding wiki page.\n\nThe price lookup command will send a link to the tarkov market website for the item.");
        }else{
            message.channel.send("I do not know that command. Type !help for a command list.");
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

/* Notes
Add images for hideout required items and kappa/task required items
Add images to ammo chart
use https://tarkov.dev/api/
*/