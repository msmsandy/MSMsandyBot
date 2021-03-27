const fs = require('fs');
const Discord = require('discord.js'); 
const keep_alive = require('./keep_alive.js');
const Enmap = require('enmap');
require('dotenv').config(); 

// bot client 
const client = new Discord.Client(); 
client.commands = new Discord.Collection();
// prefix 
const prefix = "!"

// get commands 
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`); 
    client.commands.set(command.name, command); 
}

// database 
enmap = new Enmap({
    name: "settings", 
    fetchAll: true, 
    autoFetch: true, 
    cloneLevel: 'deep'
}); 

defaultSettings = {
    test: 'hi'
}

// ready 
client.on('ready', () => {
    console.log('Bot is ready'); 
}); 

// message 
client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return; 

    enmap.ensure(message.guild.id, defaultSettings); 

    // console.log(enmap);

    const messageArray = message.content.slice(prefix.length).trim().split(/ +/);
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
});

// login 
client.login(process.env.BOT_TOKEN);
