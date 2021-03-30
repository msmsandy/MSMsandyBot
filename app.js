const fs = require('fs');
const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
const Enmap = require('enmap');
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
client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return; 

    console.log("Message: " + message.content);

    const messageArray = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
	const command = messageArray[0]; 
	const args = messageArray.slice(1);

	if (command === 'calc') {
        client.commands.get('calc').execute(message, prefix, command, args);
	}
    else if (command === 'imdabest') {
        client.commands.get('imdabest').execute(message);
    }
    else if (command === 'imnotdabest') {
        client.commands.get('imnotdabest').execute(message);
    }
    else if (command === 'whosdabest') {
        client.commands.get('whosdabest').execute(message);
    }
    else if (command === 'fame') {
        client.commands.get('fame2').execute(message, prefix, args);
    }

});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason);
});

// login 
client.login(process.env.BOT_TOKEN);
