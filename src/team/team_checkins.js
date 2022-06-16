const {
	checkinTeam, 
	checkoutTeam, 
	clearTeam, 
	TeamError, 
} = require('../../src/team');
const { view, viewType } = require('../../src/team/team_view');

const clearType = {
	here: 'here',
};

async function checkin(message, args, isOther) {
	const teamId = args[0];
	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	if (isOther && !args[1]) {
		message.channel.send('who else u checkin in brah');
		return; 
	}

	let user; 
	if (isOther && args[1].startsWith('<@') && args[1].endsWith('>')) {
		user = args[1].slice(2, -1); 
		if (user.startsWith('!')) {
			user = user.slice(1);
		}
		args = args.slice(2); 
	}
	else {
		user = message.author.id; 
		args = args.slice(1); 
	}

	const checkinText = args.join(' ').trim();

	try {
		const isUpdate = await checkinTeam(message.guild.id, teamId, user, checkinText, isOther);

		let msg = `successfully checked into \`${teamId}\``;
		if (isUpdate) {
			msg = `you were already checked into \`${teamId}\`, description: `;
			if (checkinText.length > 0) {
				msg += `\`${checkinText}\``;
			}
			else {
				msg += `none`;
			}
		}
		const embed = await view(message, teamId);
		message.channel.send(msg, { embed: embed });
	} catch (err) {
		if (err === TeamError.USER_ALREADY_CHECKED_IN) {
			const msg = `already checked into \`${teamId}\`, loser`;
			const embed = await view(message, teamId);
			message.channel.send(msg, { embed: embed });
		}
		else if (err === TeamError.TEAM_FULL) {
			const msg = `\`${teamId}\` is full sucks for you haha`;
			const embed = await view(message, teamId);
			message.channel.send(msg, { embed: embed });
		}
		else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			throw { key: err, teamId: teamId }; 
		}
		else {
			throw err; 
		}
	}
}

// Checkout 

async function checkout(message, args) {
	const teamId = args[0]; 
	if (!teamId || teamId.length === 0) {
		message.channel.send('u didnt give me a team id');
		return;
	}

	let checkoutNumber = args[1]; 
	if (checkoutNumber && !isNaN(checkoutNumber)) {
		checkoutNumber = checkoutNumber; 
	}

	try {
		await checkoutTeam(message.guild.id, teamId, message.author.id, checkoutNumber); 

		const msg = `checked out of \`${teamId}\``;
		const embed = await view(message, teamId);
		message.channel.send(msg, { embed: embed });
	} catch (err) {
		if (err === TeamError.USER_NOT_CHECKED_IN) {
			message.channel.send(`you're not checked into \`${teamId}\` ya noob`);
		}
		else if (err === TeamError.USER_CHECKED_IN_MULTIPLE) {
			const msg = `you checked into \`${teamId}\` multiple times. specify the number of the checkin to checkout`;
			const embed = await view(message, teamId);
			message.channel.send(msg, { embed: embed });
		}
		else if (err === TeamError.USER_CHECKED_IN_OTHER) {
			const msg = `you checked into \`${teamId}\` using \`checkinother\`. specify the number of the checkin to checkout`;
			const embed = await view(message, teamId);
			message.channel.send(msg, { embed: embed });
		}
		else if (err === TeamError.CHECKOUT_INVALID_INDEX) {
			message.channel.send(`that checkout number aint valid bro`);
		}
		else if (err === TeamError.TEAM_DOES_NOT_EXIST) {
			throw { key: err, teamId: teamId }; 
		}
		else {
			throw err; 
		}
	}
}

async function clear(message, args) {
	const arg = args[0]; 
	if (!arg || arg.length === 0) {
		message.reply('u didnt tell me what to clear');
		return;
	}

	if (arg === 'here') {
		await view(message, 'here'); 
		await message.reply(`do you really wish to clear the teams in this channel?\nreply with 'yes' to clear`);
		let responseFilter = m => m.author.id === message.author.id;
		let responseMessage = await message.channel.awaitMessages(responseFilter, {
	        max: 1,
	        time: 30000,
	        errors: ['time']
	    });
	    responseMessage = responseMessage.first();
	    if (responseMessage.content === 'yes') {
	    	try {
	    		let filter = team => team.channel === message.channel.id; 
	    		const teams = await clearTeam(message.guild.id, filter);
	    		const msg = `team${teams.length > 1 ? 's' : ''} cleared`; 
	    		message.channel.send(msg);
	    	} catch (err) {
	    		if (err === TeamError.TEAM_DOES_NOT_EXIST) {
	    			throw { key: err, teamId: arg }; 
	    		}
	    		else {
	    			throw err; 
	    		}
	    	}
	    } else {
	    	message.channel.send(`u didnt say 'yes' so teams not cleared`);
	    }
	} else {
		try {
			let filter = team => team.id.toLowerCase() === arg.toLowerCase(); 
			const teams = await clearTeam(message.guild.id, filter);
			const msg = `team${teams.length > 1 ? 's' : ''} cleared`; 
			message.channel.send(msg);
		} catch (err) {
			if (err === TeamError.TEAM_DOES_NOT_EXIST) {
				throw { key: err, teamId: arg }; 
			}
			else {
				throw err; 
			}
		}
	}
}

module.exports = {
	checkin, 
	checkout, 
	clear,
};
