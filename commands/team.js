const {
	getTeamListData, 
	getTeam, 
	addTeam, 
	editTeam,
	editTeamSetting,
	removeTeam, 
	checkinTeam, 
	checkoutTeam, 
	clearTeam, 
	TeamError, 
	TeamSetting,
} = require('../src/team');

const argumentType = {
	view: {
		command: 'view', 
		arguments: '`teamid | here | list | all`',
		description: 'view teams',
	},
	add: {
		command: 'newteam', 
		arguments: '`teamid` `<# of slots>` `<channel>` \"`<name>`\" \"`<description>`\"',
		description: 'add a new team with teamid, number of slots, channel (optional, default: current channel), name (optional), description (optional)',
	}, 
	delete: {
		command: 'deleteteam',
		arguments: '`teamid`',
		description: 'delete team with teamid',
	},
	edit: {
		command: 'editteam',
		arguments: '`<setting: all | teamid | slots | channel | name | description>` `teamid` `value(s)`',
		description: 'edit setting for team with teamid. `all` will overwrite all values',
	}, 
	checkin: {
		command: 'checkin', 
		arguments: '`teamid` `<optional: ign>`', 
		description: 'checkin to team with teamid',
	}, 
	checkout: {
		command: 'checkout',
		arguments: '`teamid | <# in list>`', 
		description: 'checkout of team with teamid',
	}, 
	clear: {
		command: 'clear',
		arguments: '`teamid | here`', 
		description: 'clear team with teamid',
	}, 
	help: {
		command: 'help',
		arguments: '', 
		description: 'view this',
	},
}

// Help

function help(message, prefix) {
    let description = '**team signups *(BETA)***\nplease let me know if there are any issues.\n';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += `\n\t**${prefix}team ${argumentType[command].command} ${argumentType[command].arguments}**\n\t\t\t${argumentType[command].description}`;
    }
    message.channel.send(description + '\n' + commandsString);
}

// View 

async function view(message, arg) {
	try {
		if (arg === 'all') {
			await message.reply(`do you really wish to view \`all\` teams? this will list all teams from all channels. maybe you wanted to view \`here\` which will list all teams within this channel.\nreply with what you want to continue with: \`all\` or \`here\``);
			let filter = m => m.author.id === message.author.id;
			let responseMessage = await message.channel.awaitMessages(filter, {
	            max: 1,
	            time: 30000,
	            errors: ['time']
	        });
	        responseMessage = responseMessage.first(); 
	        if (responseMessage.content === 'all') {
				const teamsText = await getTeamsText(message.guild, formatTeamText); 
				message.channel.send(`**all teams:**\n\n${teamsText}`); 
			}
			else if (responseMessage.content === 'here') {
				await view(message, 'here');
			}
			else {
				message.reply('that\'s not what i asked for');
			}
		}
		else if (arg === 'list') {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`**list of teams:**\n\n${teamsText}`); 
		}
		else if (arg === 'here') {
			const filter = team => team.channel === message.channel.id; 
			const teamsText = await getTeamsText(message.guild, formatTeamText, filter); 
			message.channel.send(`**teams in this channel:**\n\n${teamsText}`); 
		}
		else if (arg !== undefined) {
			const teamText = await getTeamText(message.guild, arg);
			message.channel.send(teamText); 
		}
		else {
			message.reply('you didn\'t specify what you wanna view, dingus');
		}
	} catch (err) {
		if (err == TeamError.TEAM_DOES_NOT_EXIST) {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${arg}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		}
		else {
			throw err; 
		}
	}
}

async function getTeamsText(guild, formatText, filter = null) {
	try {
		// TODO: sort by channel 
		let teams = (await getTeamListData(guild.id)).teams; 
		if (filter) {
			teams = teams.filter(filter);
		}
		let teamsText = []; 
		for (const team of teams) {
			console.log('team' + team.slots);
			const teamText = await formatText(guild, team);
			teamsText.push(teamText);
		}
		if (teamsText.length === 0) {
			return '```no teams```'; 
		}
		else {
			return teamsText.join('\n');
		}
	} catch (err) {
		throw err; 
	}
}

async function getTeamText(guild, teamId) {
	try {
		const team = (await getTeam(guild.id, teamId)); 
		if (team) {
			return await formatTeamText(guild, team);
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
	} catch (err) {
		throw err; 
	}
}

async function formatTeamText(guild, team) {
	let teamHeading = `\`${team.id}\`: **${team.name}** <#${team.channel}>\n${team.description}\n`;
	let teamList = []; 

	for (let i = 0; i < team.slots; i++) {
		let checkinUserText = ''; 
		const checkin = team.checkins[i]; 
		if (checkin) {
			let displayName = '';
			try {
				const member = await guild.members.fetch(checkin.user); 
				displayName = member.displayName; 
			} catch (err) {
				displayName = checkin.user; 
			}
			if (checkin.checkinText.length > 0) {
				checkinUserText = `${checkin.checkinText} (${displayName})`;
			}
			else {
				checkinUserText = `${displayName}`;
			}
		}
		teamList.push(`${i+1}. ${checkinUserText}`);
	}
	return `${teamHeading}\`\`\`${teamList.join('\n')}\`\`\``
}

function formatTeamNamesText(guild, team) {
	return `- \`${team.id}\`: ${team.name} <#${team.channel}>`;
}

// Add 

async function updateTeam(message, args, isNew) {
	console.log('args: ' + args); 

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
		console.log(matches);
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
				const teamText = await getTeamText(message.guild, teamId); 
				message.channel.send(`added team\n${teamText}`);
				
			} 
			else {
				await editTeamAll(message.guild, teamId, slots, channel, name, description); 
				const teamText = await getTeamText(message.guild, teamId); 
				message.channel.send(`updated team\n${teamText}`);
			}
		} catch (err) {
			if (err === TeamError.TEAM_ALREADY_EXISTS) {
				message.channel.send(`\`${teamId}\` already exists. please use the \`edit\` command`); 
			}
			else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
				const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
				message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
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

// Edit 

async function edit(message, args) {
	console.log('edit: ' + args); 
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
			await updateTeam(message, args, false);
		}
		else {
			message.channel.send('check yoself'); 
		}
	} catch (err) {
		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		} 
		else { throw err; }
	}
}

// Delete 

async function deleteTeam(message, teamId) {
	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	try {
		const teamText = await getTeamText(message.guild, teamId); 

		await message.reply(`do you wish to delete this team?\n${teamText}\n\nthis cannot be undone. reply with \`${teamId}\` to delete forever.`);
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
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		}
		else if (err === TeamError.TEAM_HAS_CHECKINS) {
			message.channel.send(`\`${teamId}\` has checkins. clear the team before deleting.`);
		}
		else {
			message.reply('you took too long');
		}
	}
}

// Checkin 

async function checkin(message, args) {
	console.log('args: ' + args); 
	const teamId = args[0];
	const checkinText = args.slice(1).join(' ').trim();

	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	try {
		await checkinTeam(message.guild.id, teamId, message.author.id, checkinText);
		const teamText = await getTeamText(message.guild, teamId); 
		message.channel.send(`successfully checked into \`${teamId}\`\n\n${teamText}`);
	} catch (err) {
		if (err === TeamError.USER_ALREADY_CHECKED_IN) {
			const teamText = await getTeamText(message.guild, teamId); 
			message.channel.send(`you already checked into \`${teamId}\`, loser\n\n${teamText}`);
		}
		else if (err === TeamError.TEAM_FULL) {
			const teamText = await getTeamText(message.guild, teamId); 
			message.channel.send(`\`${teamId}\` is full sucks for you haha\n\n${teamText}`);
		}
		else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		}
		else {
			throw err; 
		}
	}
}

// Checkout 

async function checkout(message, args) {
	console.log('args: ' + args); 
	const teamId = args[0]; 
	let checkoutNumber = args[1]; 

	if (!isNaN(checkoutNumber)) {
		checkoutNumber = checkoutNumber - 1; 
	}

	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	console.log(teamId + checkoutNumber);

	try {
		await checkoutTeam(message.guild.id, teamId, message.author.id, checkoutNumber); 
		const teamText = await getTeamText(message.guild, teamId); 
		message.channel.send(`checked out of \`${teamId}\`\n\n${teamText}`);
	} catch (err) {
		if (err === TeamError.USER_NOT_CHECKED_IN) {
			message.channel.send(`you're not checked into \`${teamId}\` ya noob`);
		}
		else if (err === TeamError.USER_CHECKED_IN_MULTIPLE) {
			message.channel.send(`you checked into \`${teamId}\` multiple times. please specify the number`);
		}
		else if (err === TeamError.CHECKOUT_INVALID_INDEX) {
			message.channel.send(`that number aint valid bro`);
		}
		else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		}
		else {
			throw err; 
		}
	}
}

// Clear 

async function clear(message, args) {
	const arg = args[0]; 

	if (!arg || arg.length === 0) {
		message.reply('u didnt tell me what to clear');
		return;
	}

	try {
		let filter; 
		if (arg === 'here') {
			filter = team => team.channel === message.channel.id; 
		}
		else {
			filter = team => team.id === arg; 
		}
		const teams = await clearTeam(message.guild.id, filter);
		message.channel.send(`team${teams.length > 1 ? 's' : ''} cleared`);
	} catch (err) {
		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`\`${teamId}\` does not exist. check the team id you're using.\n\nTeams:\n${teamsText}`); 
		}
		else {
			throw err; 
		}
	}
}

module.exports = {
    name: 'team', 
    description: 'Team', 
    async execute(message, prefix, args) {

    	const firstArg = args[0]; 

    	try {
    		if (firstArg === argumentType.help.command) {
    			help(message, prefix);
    		}
	    	else if (firstArg === argumentType.view.command) {
	    		await view(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.add.command) {
	    		await updateTeam(message, args.slice(1), true);
	    	}
	    	else if (firstArg === argumentType.edit.command) {
	    		await edit(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.delete.command) {
	    		await deleteTeam(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.checkin.command) {
	    		await checkin(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.checkout.command) {
	    		await checkout(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.clear.command) {
	    		await clear(message, args.slice(1));
	    	}
	    	else {
	    		message.reply('wtf u doin');
	    	}
    	} catch (err) {
    		throw err; 
    	}
    }
};