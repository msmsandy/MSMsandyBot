const {
	getTeamListData, 
	getTeam, 
	addOrUpdateTeam, 
	removeTeam, 
	checkinTeam, 
	checkoutTeam, 
	clearTeam, 
	TeamError, 
} = require('../src/team');

const argumentType = {
	view: {
		command: 'view', 
		description: '`teamid | list | here | all`',
	},
	add: {
		command: 'add', 
		description: '`teamid` `<# of slots>` `\"<name>\"` `\"<description>\"`',
	}, 
	// remove: {
	// 	command: 'remove',
	// 	description: '`teamid`',
	// },
	// edit: {
	// 	command: 'edit',
	// 	description: 'teamid <name | slots> <\"<name>\" | # >', 
	// }, 
	checkin: {
		command: 'checkin', 
		description: '`teamid` `<optional: specific signup text>`'
	}, 
	checkout: {
		command: 'checkout',
		description: '`teamid | <# in list>`'
	}, 
	clear: {
		command: 'clear',
		description: '`teamid`'
	}, 
	help: {
		command: 'help',
		description: '',
	},
}

// Help

function help(message, prefix) {
    let description = '**Team Signups *(BETA)***\nPlease let me know if there are any issues.';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += `\n\t${prefix}team ${argumentType[command].command} ${argumentType[command].description}`;
    }
    message.channel.send(description + '\n' + commandsString);
}

// View 

async function view(message, arg) {
	try {
		if (arg === 'all') {
			const teamsText = await getTeamsText(message.guild, formatTeamText); 
			message.channel.send(`**Teams:**\n\n${teamsText}`); 
		}
		else if (arg === 'list') {
			const teamsText = await getTeamsText(message.guild, formatTeamNamesText);
			message.channel.send(`**Teams:**\n\n${teamsText}`); 
		}
		else if (arg === 'here') {
			message.reply('not implemented yet');
		}
		else if (arg !== undefined) {
			const teamText = await getTeamText(message.guild, arg);

			if (teamText) {
				message.channel.send(teamText); 
			}
			else {
				message.channel.send('team does not exist');
			}
		}
		else {
			message.reply('you didn\'t specify what you wanna view, dingus');
		}
	} catch (err) {
		throw err; 
	}
}

async function getTeamsText(guild, formatText) {
	try {
		const teams = (await getTeamListData(guild.id)).teams; 
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
			return undefined; 
		}
	} catch (err) {
		throw err; 
	}
}

async function formatTeamText(guild, team) {
	let teamHeading = `\`${team.id}\`: **${team.name}**\n${team.description}\n`;
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
	return `- \`${team.id}\`: ${team.name}`;
}

// Add 

async function add(message, args) {
	console.log('args: ' + args); 

	let teamId = args[0];
	let slots = args[1];

	const matches = args.slice(2).join(' ').match(/"(.*?)"/gs);
	console.log('111' + args.slice(2).join(' '));
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

	if (teamId && slots && !isNaN(slots.trim())) {
		teamId = teamId.trim(); 
		slots = slots.trim();

		console.log(`Adding \tteam: ${teamId}\n\tslots: ${slots}\n\tname: ${name}\n\tdescription: ${description}`);

		await addTeam(message.guild, teamId, slots, name, description);

		message.channel.send("added team");
	}
	else {
		message.channel.send("check yo arguments: teamId slots name description");
	}
}

async function addTeam(guild, teamId, slots, name, description) {
	try {
		await addOrUpdateTeam(guild.id, teamId, slots, name, description); 
	} catch (err) {
		throw err; 
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
	const teamId = args[0]; 

	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	try {
		await clearTeam(message.guild.id, teamId);
		const teamText = await getTeamText(message.guild, teamId);
		message.channel.send(`\`${teamId}\` cleared\n\n${teamText}`);
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
	    		// view teams 
	    		await view(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.add.command) {
	    		await add(message, args.slice(1));
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