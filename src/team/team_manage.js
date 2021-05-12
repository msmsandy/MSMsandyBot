const {
	addTeam, 
	editTeam,
	editTeamSetting,
	removeTeam, 
	TeamError, 
	TeamSetting, 
} = require('../../src/team');

const { list, view } = require('../../src/team/team_view');

async function update(message, args, isNew) {
	let teamId = args[0];
	let slots = args[1];

	args = args.slice(2); 

	let channel; 
	if (args[0] && args[0].startsWith('<#') && args[0].endsWith('>')) {
		channel = args[0].slice(2, -1); 
		args = args.slice(1); 
	}
	else {
		channel = message.channel.id; 
	}

	const matches = args.join(' ').match(/"(.*?)"/gs);
	let name = undefined; 
	let description = undefined;
	if (matches) {
		name = matches[0]; 
		description = matches[1];

		if (name) {
			name = name.slice(1, -1).trim();
		}
		if (description) {
			description = description.slice(1, -1).trim();
		}
	}

	console.log(teamId + slots + channel + name + description);

	if (teamId && slots && !isNaN(slots.trim())) {
		teamId = teamId.trim(); 
		slots = slots.trim();

		console.log(`Updating \tteam: ${teamId}\n\tslots: ${slots}\n\tchannel: ${channel}\n\tname: ${name}\n\tdescription: ${description}`);

		try {
			if (isNew) {
				await addNewTeam(message.guild, teamId, slots, channel, name, description);
				const msg = `added team \`${teamId}\`\n`;
				const embed = await list(message, teamId);
				message.channel.send(msg, { embed: embed });	
			} 
			else {
				await editTeamAll(message.guild, teamId, slots, channel, name, description); 
				const msg = `updated team \`${teamId}\``;
				const embed = await list(message, teamId);
				message.channel.send(msg, { embed: embed });
			}
		} catch (err) {
			if (err === TeamError.TEAM_ALREADY_EXISTS) {
				message.channel.send(`\`${teamId}\` already exists. please use the \`edit\` command`); 
			}
			else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
				throw { key: err, teamId: teamId }; 
			}
			else {
				throw err; 
			}
		}
	}
	else {
		message.channel.send("check yo arguments: teamId slots name description");
	}
}

async function edit(message, args) {
	const setting = args[0];
	args = args.slice(1);
	const teamId = args[0]; 

	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	try {
		if (setting === TeamSetting.TEAM_ID) {
			const newTeamId = args[1];

			if (newTeamId) {
				const oldValue = await editTeamSetting(TeamSetting.TEAM_ID, message.guild.id, teamId, newTeamId);
				message.channel.send(`\`${oldValue}\` changed to \`${newTeamId}\``);
			}
			else {
				message.channel.send('no new value');
			}
		}
		else if (setting === TeamSetting.SLOTS) {
			const slots = args[1];

			if (slots && !isNaN(slots)) {
				const oldValue = await editTeamSetting(TeamSetting.SLOTS, message.guild.id, teamId, slots);
				message.channel.send(`\`${teamId}\`'s slot capacity changed from \`${oldValue}\` to \`${slots}\``);
			}
			else {
				message.channel.send('invalid or no new value');
			}
		}
		else if (setting === TeamSetting.CHANNEL) {
			let channel = args[1];
			if (channel && channel.startsWith('<#') && channel.endsWith('>')) {
				channel = channel.slice(2, -1); 
				const oldValue = await editTeamSetting(TeamSetting.CHANNEL, message.guild.id, teamId, channel);
				message.channel.send(`\`${teamId}\`'s channel changed from <#${oldValue}> to <#${channel}>`);
			}
			else {
				message.channel.send('no new value');
			}
		}
		else if (setting === TeamSetting.NAME || setting === TeamSetting.DESCRIPTION) {
			args = args.slice(1);

			const matches = args.join(' ').match(/"(.*?)"/gs);
			let newValue = undefined; 
			if (matches) {
				console.log(matches);
				newValue = matches[0]; 
				if (newValue) {
					newValue = newValue.slice(1, -1).trim();
				}
			}

			if (newValue) {
				const oldValue = await editTeamSetting(setting, message.guild.id, teamId, newValue);
				message.channel.send(`\`${teamId}\`'s updated from \`${oldValue}\` to \`${newValue}\``);
			}
			else {
				message.channel.send('no new value. make sure it\'s in quotation marks.');
			}
		}
		else if (setting === 'all') {
			await update(message, args, false);
		}
		else {
			message.channel.send('check yoself'); 
		}
	} catch (err) {
		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			throw { key: err, teamId: teamId }; 
		}
		else if (err === TeamError.TEAM_HAS_CHECKINS) {
			message.channel.send(`\`${teamId}\` has checkins. clear it before you try to do anything else.`);
		}
		else if (err === TeamError.TEAM_ALREADY_EXISTS) {
			message.channel.send(`\`${args[1]}\` already exists.`);
		}
		else { throw err; }
	}
}

async function remove(message, teamId) {
	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	try {
		const msg = `do you wish to delete this team?\nthis cannot be undone. reply with \`${teamId}\` to delete forever.`;
		const embed = await view(message, teamId);
		await message.reply(msg, { embed: embed });

		let filter = m => m.author.id === message.author.id;
		let responseMessage = await message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        });
        responseMessage = responseMessage.first(); 

        if (responseMessage.content === teamId) {
        	await removeTeam(message.guild.id, teamId); 
			message.channel.send(`${teamId} has been deleted`);
        }
		else {
			message.channel.send(`${teamId} has not been deleted`);
		}
	} catch (err) {
		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			throw { key: err, teamId: teamId }; 
		}
		else {
			message.reply('you took too long');
		}
	}
}

async function addNewTeam(guild, teamId, slots, channel, name, description) {
	try {
		await addTeam(guild.id, teamId, slots, channel, name, description); 
	} catch (err) {
		throw err; 
	}
}

async function editTeamAll(guild, teamId, slots, channel, name, description) {
	try {
		await editTeam(guild.id, teamId, slots, channel, name, description); 
	} catch (err) {
		throw err; 
	}
}

module.exports = {
	update, 
	edit, 
	remove, 
};
