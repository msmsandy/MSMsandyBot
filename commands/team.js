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

const teamsKey = 'teams'

function view(message, arg) {
	if (arg === 'all') {
		const teams = enmap.get(message.guild.id, teamsKey);
		let teamsText = '';
		for (const key in teams) {
			const team = teams[key]; 
			const name = team.name; 
			const slots = team.slots; 

			if (name && slots) {
				teamsText += '\n\t' + name + ' ' + slots; 
			}
		}

		if (teamsText.length > 0) {
			message.channel.send('teams: ' + teamsText);
		}
		else {
			message.channel.send('no teams');
		}
	}
	else if (arg === 'here') {
		// get all the teams within this channel 
	}
	else if (arg !== undefined) {
		// find team id 
	}
	else {
		message.reply('u need help');
	}
}

module.exports = {
    name: 'team', 
    description: 'Team', 
    execute(message, prefix, args) {

    	const firstArg = args[0]; 

    	if (firstArg === argumentType.view.command) {
    		// view teams 
    		view(message, args[1]);
    	}
    }
};