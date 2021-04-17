const moment = require('moment');
const momentTz = require('moment-timezone'); // time 
module.exports = {
	name: 'calc', 
	description: 'calculate how much AB you need to charge. Currently only based on NA server time.', 
	execute(message, prefix, command, args) {
		function parseTime(s) {
	        var c = s.split(':');
	        return parseInt(c[0]) * 60 + parseInt(c[1]);
    	}

        function sendError(error) {
            let errorMessage = 'dimwit, ' + error; 
            message.reply(errorMessage); 
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

                message.reply('to AB to ' + hour + ':' + minute + ', load '+ minutes + ' minutes of AB. you could\'ve calculated that yourself, dimwit.'); 
            } 
            else {
                sendError('that\s not how time works.');
            }    		
    	}
        else if (args[0] == 'help') {
            sendMessage('tell me when you want to AB until (server time) and i\'ll tell you how much ab to load.\nthe command is: `' + prefix + 'calc HH:MM`');
        }
        else {
    		sendError('the command is `' + prefix + 'calc HH:MM`.');
    	}
	}
}