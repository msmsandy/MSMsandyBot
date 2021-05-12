const fs = require('fs');
const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
const cron = require('node-cron');
require('dotenv').config(); 

// bot client 
const client = new Discord.Client(); 
client.commands = new Discord.Collection();

// prefix 
const prefix = process.env.DEBUG ? "$" : "!";

// get commands 
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`); 
    client.commands.set(command.name, command); 
}

// ready 
client.on('ready', () => {
    console.log('MSMsandyBot up!'); 
}); 

// message 
client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return; 

    console.log("Message: " + message.content);

    const messageArray = message.content.slice(prefix.length).trim().split(/ +/);
	const command = messageArray[0].toLowerCase(); 
	const args = messageArray.slice(1);

    try {
    	if (command === 'calc') {
            client.commands.get('calc').execute(message, prefix, command, args);
    	}
        else if (command === 'imdabest') {
            await client.commands.get('imdabest').execute(message);
        }
        else if (command === 'imnotdabest') {
            await client.commands.get('imnotdabest').execute(message);
        }
        else if (command === 'whosdabest') {
            await client.commands.get('whosdabest').execute(message);
        }
        else if (command === 'fame') {
            await client.commands.get('fame').execute(message, prefix, args);
        }
        else if (command === 'team') {
            await client.commands.get('team').execute(message, prefix, args);
        }
        else if (command === 'forge') {
            client.commands.get('forge').execute(message, args); 
        }
        else if (command === 'help') {
            let commandsStrings = []; 
            client.commands.forEach( command => {
                console.log(command);
                if (!command.private) {
                    let commandString = `\t\`${prefix}${command.name}\` - ${command.description}`;
                    commandsStrings.push(commandString);
                }
            });
            const commandsString = commandsStrings.join('\n');
            const helpString = `**Commands**\nUse \`${prefix}command help\` for more info.\n\n${commandsString}\n\n*DISCLAIMER: This bot is currently in development. Should you find any issues or have any feedback, please contact **msm_sandy#6666***`;
            message.channel.send(helpString);
        }
    } catch (err) {
        console.log(err);
        message.channel.send("Unhandled error: " + err);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason);
});

cron.schedule('* * * * *', function() {
  console.log('running a task every minute');
});

// login 
client.login(process.env.BOT_TOKEN);
