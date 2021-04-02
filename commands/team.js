const {
	getTeamListData, 
	getTeam, 
	addOrUpdateTeam, 
	removeTeam, 
	checkin, 
	checkout, 
} = require('../src/team');

const argumentType = {
	view: {
		command: 'view', 
		description: 'teamid | here | all',
	},
	add: {
		command: 'add', 
		description: 'teamid \"<name>\" <# of slots>',
	}, 
	remove: {
		command: 'remove',
		description: 'teamid',
	},
	edit: {
		command: 'edit',
		description: 'teamid <name | slots> <\"<name>\" | # >', 
	}, 
	signup: {
		command: 'checkin', 
		description: 'teamid <optional: \"<specific signup text>\">'
	}, 
	dropout: {
		command: 'dropout',
		description: '<teamid | <# in list>>'
	}, 
	clear: {
		command: 'clear',
		description: 'teamid'
	}
}

// View 

async function view(message, arg) {
	try {
		if (arg === 'all') {
			const teamsText = await getTeamsText(message.guild.id, formatTeamText); 
			message.channel.send(`**Teams:**\n\n${teamsText}`); 
		}
		else if (arg === 'teams') {
			const teamsText = await getTeamsText(message.guild.id, formatTeamNamesText);
			message.channel.send(`**Teams:**\n\n${teamsText}`); 
		}
		else if (arg === 'here') {
			message.reply('not implemented yet');
		}
		else if (arg !== undefined) {
			const teamText = await getTeamText(message.guild.id, arg);

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

async function getTeamsText(guildId, teamFunction) {
	try {
		const teams = (await getTeamListData(guildId)).teams; 
		let teamsText = []; 
		for (const team of teams) {
			console.log('team' + team.slots);
			const teamText = teamFunction(team);
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

async function getTeamText(guildId, teamId) {
	try {
		const team = (await getTeam(guildId, teamId)); 
		if (team) {
			return formatTeamText(team);
		}
		else {
			return undefined; 
		}
	} catch (err) {
		throw err; 
	}
}

function formatTeamText(team) {
	let teamHeading = `\`${team.id}\`: **${team.name}**\n> ${team.description}\n`;
	let teamList = []; 

	for (let i = 0; i < team.slots; i++) {
		let checkinUserText = ''; 
		const checkin = team.checkins[i]; 
		if (checkin) {
			checkinUserText = checkin.user; 
		}
		teamList.push(`${i+1}. ${checkinUserText}`);
	}
	return `${teamHeading}\`\`\`${teamList.join('\n')}\`\`\``
}

function formatTeamNamesText(team) {
	return `- \`${team.id}\`: ${team.name}`;
}

// Add 

async function add(message, args) {
	console.log('args: ' + args); 

	let teamId = args[0];
	let slots = args[1];

	const matches = args.slice(2).join(' ').match(/"(.*?)"/g);
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

	if (teamId && slots && !isNaN(slots.trim())) {
		teamId = teamId.trim(); 
		slots = slots.trim();

		console.log(`Adding \tteam: ${teamId}\n\tslots: ${slots}\n\tname: ${name}\n\tdescription: ${description}`);

		await addTeam(message.guild.id, teamId, slots, name, description);

		message.channel.send("added team");
	}
	else {
		message.channel.send("check yo arguments: teamId slots name description");
	}
}

async function addTeam(guildId, teamId, slots, name, description) {
	try {
		await addOrUpdateTeam(guildId, teamId, slots, name, description); 
	} catch (err) {
		throw err; 
	}
}

// async function checkin(guildId, teamId, user, displayName, signupText) {
// 	try {
// 		await checkin(guildId, teamId, user, displayName, signupText);
// 	} catch (err) {
// 		throw err; 
// 	}
// }

module.exports = {
    name: 'team', 
    description: 'Team', 
    async execute(message, prefix, args) {

    	const firstArg = args[0]; 

    	try {
	    	if (firstArg === argumentType.view.command) {
	    		// view teams 
	    		await view(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.add.command) {
	    		await add(message, args.slice(1));
	    	}
    	} catch (err) {
    		throw err; 
    	}
    }
};