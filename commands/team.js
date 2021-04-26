const Discord = require('discord.js');
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
const Format = require('../src/team/team_format');
const { view, list, viewType } = require('../src/team/team_view');
const { mention } = require('../src/team/team_mention');
const { checkin, checkout, clear } = require('../src/team/team_checkins');
const { update, edit, remove } = require('../src/team/team_manage');

const argumentType = {
	list: {
		command: 'list', 
		arguments: '`teamid | here | all`',
		description: 'show details of team(s)',
	},
	view: {
		command: 'view', 
		arguments: '`teamid | here | all`',
		description: 'show details of team(s) with checkins',
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
		arguments: '`teamid` `<optional: description>`', 
		description: 'checkin to team with teamid. checking in again with a new description will update the description. only a max of 1 checkin per user can exist.',
	}, 
	checkinother: {
		command: 'checkinother', 
		arguments: '`teamid` `<optional: @user>` `<optional: description>`', 
		description: 'checkin someone else to team with teamid. providing an @user will tie that user to the checkin for mentions. every checkinother will create a new checkin',
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
	mention: {
		command: 'mention', 
		arguments: '`teamid` `message`',
		description: 'mention all users with message in the team with teamid',
	}, 
	help: {
		command: 'help',
		arguments: '', 
		description: 'view this',
	},
}

function help(message, prefix) {
    let description = '**team signups *(BETA)***\nplease let me know if there are any issues.\n';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += `\n\t**${prefix}team ${argumentType[command].command} ${argumentType[command].arguments}**\n\t\t\t${argumentType[command].description}`;
    }
    message.channel.send(description + '\n' + commandsString);
}

async function handleTeamDoesNotExist(message, teamId) {
	try {
		const msg = `\`${teamId}\` does not exist. check the team id you're using.`;
		const embed = await list(message, viewType.here);
		message.channel.send(msg, { embed: embed });
	} catch (err) {
		throw err; 
	}
}

module.exports = {
    name: 'team', 
    description: 'set up teams for checking into', 
    async execute(message, prefix, args) {

    	const firstArg = args[0]; 

    	try {
    		if (firstArg === argumentType.help.command) {
    			help(message, prefix);
    		}
	    	else if (firstArg === argumentType.view.command) {
	    		await view(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.list.command) {
	    		await list(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.add.command) {
	    		await update(message, args.slice(1), true);
	    	}
	    	else if (firstArg === argumentType.edit.command) {
	    		await edit(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.delete.command) {
	    		await remove(message, args[1]);
	    	}
	    	else if (firstArg === argumentType.checkin.command) {
	    		await checkin(message, args.slice(1), false);
	    	}
	    	else if (firstArg === argumentType.checkinother.command) {
	    		await checkin(message, args.slice(1), true);
	    	}
	    	else if (firstArg === argumentType.checkout.command) {
	    		await checkout(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.clear.command) {
	    		await clear(message, args.slice(1));
	    	}
	    	else if (firstArg === argumentType.mention.command) {
	    		await mention(message, args.slice(1));
	    	}
	    	else {
	    		message.reply('wtf u doin');
	    	}
    	} catch (err) {
    		if (err.key === TeamError.TEAM_DOES_NOT_EXIST && err.teamId) {
				handleTeamDoesNotExist(message, err.teamId);
			}
			else {
    			throw err; 
			}
    	}
    }
};