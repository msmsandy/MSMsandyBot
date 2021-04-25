const Discord = require('discord.js');
const { getTeamListData, getTeam, TeamError } = require('../../src/team');
const Format = require('../../src/team/team_format');

const viewType = {
	all: 'all',
	here: 'here',
}

const alphabeticalSort = (team1, team2) => (team1.id.toLowerCase() < team2.id.toLowerCase()) ? -1 : 1;
const channelFilter = message => ( team => team.channel === message.channel.id ); 

// view teamid, here, all 
// teamid: team + details + checkins
// here: channel's team list + checkins 
// all: server's team list + checkins 
async function view(message, arg) {
	try {		
		if (arg === viewType.all) {
			await message.reply(`do you really wish to view \`all\` teams? this will list all teams from all channels. maybe you wanted to view \`here\` which will list all teams within this channel.\nreply with what you want to continue with: \`all\` or \`here\``);
			let filter = m => m.author.id === message.author.id;
			let responseMessage = await message.channel.awaitMessages(filter, {
	            max: 1,
	            time: 30000,
	            errors: ['time']
	        });
	        responseMessage = responseMessage.first(); 
	        if (responseMessage.content === 'all') {
	        	const title = `teams`;
	        	const description = `all teams in the server`;
				const embed = await getTeamsEmbed(message.guild, null, alphabeticalSort, title, description, Format.FormatStyle.view);
				message.channel.send(embed);
			}
			else if (responseMessage.content === 'here') {
				await view(message, 'here');
			}
			else {
				message.reply('that\'s not what i asked for');
			}
		}
		else if (arg === viewType.here) {			 
			const title = `teams`;
	        const description = `all teams in <#${message.channel.id}>`;
			const embed = await getTeamsEmbed(message.guild, channelFilter(message), alphabeticalSort, title, description, Format.FormatStyle.view);
			message.channel.send(embed);
		}
		else if (arg !== undefined) {
			const filter = team => team.id === arg;
			const title = `team`; 
			const description = ``; 
			const embed = await getTeamsEmbed(message.guild, filter, alphabeticalSort, title, description, Format.FormatStyle.view, true);
			message.channel.send(embed);
		}
		else {
			message.reply('you didn\'t specify what you wanna view, dingus');
		}
	} catch (err) {
		if (err == TeamError.TEAM_DOES_NOT_EXIST) {
			const msg = `\`${arg}\` does not exist. check the team id you're using.`;
			const embed = await list(message, viewType.here);
			message.channel.send(msg, { embed: embed });
		}
		else {
			throw err; 
		}
	}
}

// list teamid, here, all 
// teamid: team + details 
// here: channel's team list 
// all: server's team list 
async function list(message, arg) {
	try {
		let title = `teams`;
		let filter = null; 
		let description; 
		let style = Format.FormatStyle.list; 
		let isSingle = false;

		if (arg === viewType.all) {
        	description = `all teams in the server`;
		}
		else if (arg === viewType.here) {
	        description = `all teams in <#${message.channel.id}>`;
	        filter = channelFilter(message); 
		}
		else if (arg !== undefined) {
			filter = team => team.id === arg; 
			description = arg;  

			title = `team`; 
			description = ``; 
			isSingle = true; 
		}
		else {
			message.reply('you didn\'t specify what you wanna list, dingus');
			return; 
		}

		const embed = await getTeamsEmbed(message.guild, filter, alphabeticalSort, title, description, style, isSingle);
		message.channel.send(embed);
	} catch (err) {
		if (err == TeamError.TEAM_DOES_NOT_EXIST) {
			const msg = `\`${arg}\` does not exist. check the team id you're using.`;
			const embed = await list(message, viewType.here);
			message.channel.send(msg, { embed: embed });
		}
		else {
			throw err; 
		} 
	}
} 

async function getTeamsEmbed(guild, filter = null, sortFunction = null, title, description, style, isSingle = false) {
	try {
		let teams = (await getTeamListData(guild.id)).teams; 

		if (filter) {
			teams = teams.filter(filter);
		}
		if (sortFunction) {
			console.log("sorted" + teams);
			teams.sort(sortFunction);
		}

		if (teams.length === 0 && isSingle) {
			throw TeamError.TEAM_DOES_NOT_EXIST;
		}

		let fields = [];
		for (const team of teams) {
			const field = await Format.teamField(guild, team, style);
			fields.push(field);
		}

		let embed = new Discord.MessageEmbed()
			.setTitle(title)
			.setDescription(description); 

		if (fields.length > 0) {
			embed.addFields(fields);
		}
		else {
			embed.addField('no teams', '** **');
		}

		return embed;
	} catch (err) {
		throw err; 
	}
}

module.exports = {
	view,
	list,
	viewType,
};