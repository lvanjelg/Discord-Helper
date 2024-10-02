const fs = require('fs');

fs.readFile("./res.json",'utf-8',(err,jsonString)=>{
    if(err){
        console.log("File read failed:",err);
        return;
    }
    //console.log(jsonString);
    var temp = jsonString.split(" ");
    var ret;
    for(var i = 0; i < temp.length; i++){
        if(temp[i].length > 8)
            ret = temp[i].trim();
    }
    console.log(ret.replace("\"",''));
})