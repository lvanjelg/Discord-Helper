const fs = require('fs');
const strats = JSON.parse(fs.readFileSync('cs_strats.json'));
let rand = Math.floor(Math.random(strats.reg.length)*strats.reg.length);
console.log(rand);
console.log(strats.reg.length)