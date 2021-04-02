const fs = require('fs');
const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
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

    const messageArray = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
	const command = messageArray[0]; 
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
        // else if (command === 'team') {
        //     await client.commands.get('team').execute(message, prefix, args);
        // }
    } catch (err) {
        console.log(err);
        message.channel.send("Unhandled error: " + err);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason);
});

// login 
client.login(process.env.BOT_TOKEN);
