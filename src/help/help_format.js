const Discord = require('discord.js');

function getHelpEmbed(commands, title, description) {
	let fields = [];
	for (const command in commands) {
		const field = commandField(commands[command]);
		fields.push(field);
	}

	let embed = new Discord.MessageEmbed()
		.setTitle(title)
		.setDescription(description); 

	if (fields.length > 0) {
		embed.addFields(fields);
	}

	return embed;
}


function commandField(command) {
	let name = command.name; 
	let inline = false; 
	let description = command.description; 
	let arguments = command.arguments; 
	// let value = [arguments, description].join('\n');

	let commandString = `\`${command.command}\``; 
	if (arguments.length > 0) {
		commandString += ` ${arguments}`;
	}
	if (description.length > 0) {
		commandString += `\n${description}`;
	}

	let value = commandString;

	let field = {
		name: name,
		value: value,
		inline: inline,
	}
	return field;
}; 

module.exports = {
	getHelpEmbed,
};
