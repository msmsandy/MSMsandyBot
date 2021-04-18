const Discord = require('discord.js');

const FormatStyle = {
	inline: "inline",
	compact: "compact", 
	full: "full",
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
	let checkinStrings = [];
	for (let i = 0; i < team.slots; i++) {
		const checkin = team.checkins[i]
		let string; 
		if (checkin) {
			string = await checkinString(guild, checkin);
		}
		checkinStrings.push(`${i+1}. ${string ? string : ''}`);
	}

	let name = '** **'; 
	let value = checkinStrings.join('\n');
	let inline = false; 
	if (style === FormatStyle.full || style === FormatStyle.inline) {
		if (style === FormatStyle.inline) {
			checkinStrings = [];
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
			checkinStrings.unshift(`${description}\n`);
		}

		value = checkinStrings.join('\n'); 

		inline = true; 
	}

	let field = {
		name: name,
		value: value,
		inline: inline,
	}
	return field;
}

function teamHeading(team) {
	let text = `\`${team.id}\``;
	if (team.name) {
		text += `: **${team.name}**`;
	}
	if (team.channel) {
		text += ` in <#${team.channel}>`; 
	}
	if (team.description) {
		text += `\n\t${team.description}`; 
	}
	return text; 
}

async function teamItem(guild, team, style) {
	if (style === FormatStyle.inline) {
		let text = `- \`${team.id}\``;
		if (team.name) {
			text += `: ${team.name}`;
		}
		if (team.channel) {
			text += ` <#${team.channel}>`;
		}
		return text;
	}
	else if (style === FormatStyle.full) {
		let heading = teamHeading(team);
		let checkinsText = []; 

		for (let i = 0; i < team.slots; i++) {
			const checkin = team.checkins[i]; 
			let checkinText = ''; 
			if (checkin) {
				checkinText = await checkinString(guild, checkin);
			}
			checkinsText.push(`${i+1}. ${checkinText}`);
		}
		return `${heading}\n\`\`\`${checkinsText.join('\n')}\`\`\``
	}
}

module.exports = {
	FormatStyle,
	teamItem, 
	teamField, 
};