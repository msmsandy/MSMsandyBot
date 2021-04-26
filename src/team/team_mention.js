const { getTeam, TeamError } = require('../../src/team');

async function mention(message, args) {
	const teamId = args[0]; 
	const mentionMessage = args.slice(1).join(' '); 
	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}
	if (mentionMessage.length === 0) {
		message.channel.send('u didnt give me words to say');
		return;
	}
	try {
		const team = await getTeam(message.guild.id, teamId); 

		let userTexts = [];
		team.checkins.forEach( checkin => {
			let userText = `<@${checkin.user}>`;
			if (checkin.checkinText && checkin.checkinText.length !== 0) {
				userText += ` (${checkin.checkinText})`;
			}
			userTexts.push(userText);
		});

		if (userTexts.length === 0) {
			message.channel.send(`there's no one to mention in \`${teamId}\``);
		}
		else {
			let messageText = `${mentionMessage}\n\n${userTexts.join(', ')}`;
			message.channel.send(messageText);
		}
	} catch (err) {
		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			throw { key: err, teamId: teamId}; 
		}
		else {
			throw err; 
		}
	}
}

module.exports = {
	mention,
};