const Discord = require('discord.js');

const FormatStyle = {
	view: "view", 
	list: "list", 
}

async function checkinString(guild, checkin) {
	let displayName = '';
	try {
		const member = await guild.members.fetch(checkin.user); 
		displayName = `${member.displayName}`; 
	} catch (err) {
		console.log(err);
		displayName = `${checkin.user}`; 
	}
	let checkinUserText = ''; 
	if (checkin.checkinText.length > 0) {
		checkinUserText = `${checkin.checkinText} (${displayName})`;
	}
	else {
		checkinUserText = `${displayName}`;
	}
	return checkinUserText
}

async function teamField(guild, team, style) {
	let name = '** **'; 
	let value; 
	let inline = false; 

	if (style === FormatStyle.list) {
		name = `\`${team.id}\``;
		if (team.name) {
			name += `: ${team.name}`;
		}

		let description = ''; 
		if (team.description) {
			description += `${team.description}`;
		}
		description += ` \`(${team.slots})\``;
		if (team.channel) {
			description += ` <#${team.channel}>`;
		}
		value = description;

		inline = true;
	}
	else {
		let valueStrings = [];
		for (let i = 0; i < team.slots; i++) {
			const checkin = team.checkins[i]
			let string; 
			if (checkin) {
				string = await checkinString(guild, checkin);
			}
			valueStrings.push(`${i+1}. ${string ? string : ''}`);
		}
		name = `\`${team.id}\``;
		if (team.name) {
			name += `: ${team.name}`;
		}
		let description = ''; 
		if (team.description) {
			description += `${team.description}`;
		}
		if (team.channel) {
			description += ` <#${team.channel}>`;
		}

		if (description.length > 0) {
			valueStrings.unshift(`${description}\n`);
		}

		value = valueStrings.join('\n');
		inline = true; 
	}

	let field = {
		name: name,
		value: value,
		inline: inline,
	}
	return field;
}

module.exports = {
	FormatStyle,
	teamField, 
};