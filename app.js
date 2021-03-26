const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
const moment = require('moment-timezone'); // time 
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

        function sendError(error) {
            let errorMessage = 'dimwit, ' + error; 
            message.channel.send(errorMessage); 
        }

        function sendMessage(text) {
            message.channel.send(text); 
        }


    	if (args[0] != undefined && args[0].includes(':')) {
            let splitTime = args[0].split(':'); 
            let hour = splitTime[0]
            let minute = splitTime[1]

            if (!isNaN(hour) && !isNaN(minute) && hour < 24 && minute < 60) {
                let currentTime = moment().tz('America/Anchorage').format('HH:mm'); 

                let parsedInputtedTime = parseTime(args[0]); 
                let parsedCurrentTime = parseTime(currentTime); 

                if (parsedInputtedTime < parsedCurrentTime) {
                    parsedInputtedTime = parsedInputtedTime + 1440; 
                } 
                let minutes = Math.abs(parsedInputtedTime - parsedCurrentTime); 

                message.reply('load '+ minutes + ' minutes of AB. you could\'ve calculated that yourself, dimwit.'); 
            } else {
                sendError('that\s not how time works.');
            }    		
    	}
        else if (args[0] == 'help') {
            sendMessage('tell me when you want to AB until (server time) and i\'ll tell you how much ab to load.\nthe command is: `!calc HH:MM`');
        }
        else {
    		sendError('the command is `!calc HH:MM`.');
    	}

    	return; 
	}
});

