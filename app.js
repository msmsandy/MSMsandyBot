const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
const moment = require('moment-timezone');
 // time 
require('dotenv').config(); 

const client = new Discord.Client(); 

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
    console.log('Bot is ready'); 
}); 


client.on('message', (message) => {
	if (message.content === 'Hello') message.reply('Hi'); 

	let messageArray = message.content.split(" "); 
	let command = messageArray[0]; 
	let args = messageArray.slice(1);

	if (command === '!calc') {

		function parseTime(s) {
	        var c = s.split(':');
	        return parseInt(c[0]) * 60 + parseInt(c[1]);
    	}

    	let errorMessage = 'Dimwit, the command is `!calc HH:MM`'; 

    	if (args[0] === undefined) {
    		message.channel.send(errorMessage); 
    	} else if (args[0].includes(':')) {
    		let splitTime = args[0].split(':'); 

    		if (!isNaN(splitTime[0]) && !isNaN(splitTime[1])) {
    			let currentTime = moment().tz('America/Anchorage').format('HH:mm'); 

    			let parsedInputtedTime = parseTime(args[0]); 
    			let parsedCurrentTime = parseTime(currentTime); 

    			if (parsedInputtedTime < parsedCurrentTime) {
    				parsedInputtedTime = parsedInputtedTime + 1440; 
    			} else {
    			}
				let minutes = Math.abs(parsedInputtedTime - parsedCurrentTime); 

				message.reply('Load '+ minutes + ' minutes of AB. You could\'ve calculated that yourself, dimwit.'); 
    		}
    	} else {
    		message.channel.send(errorMessage); 
    	}

    	return; 
	}
});

