const db = require('./database');
const { Team, TeamList, Checkin } = require('./models/team'); 

async function getTeamListData(guildId) {
	console.log("Getting Team List Data for " + guildId);

	try {
		const defaultData = Team({ guildId: guildId, teams: [] }); 
		
		const data = await TeamList.findOneAndUpdate(
			{ guildId: guildId }, 
			{ $setOnInsert: defaultData }, 
			{ upsert: true, new: true, runValidators: true },
		);

		// console.log(data);
		return data; 
	} catch (err) {
		// console.error(err);
		throw err; 
	}
}

async function getTeam(guildId, teamId) {
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 
		if (team) {
			return team; 
		} 
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST;
		}
	} catch (err) {
		throw err; 
	}
}

// returns existing team if it exists 
async function addTeam(guildId, teamId, slots, channel, name, description) {
	try {
		const teamList = await getTeamListData(guildId); 
		
		let existingTeam = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 

		if (existingTeam !== undefined) {
			throw TeamError.TEAM_ALREADY_EXISTS;
		}
		else {
			const team = Team({
				id: teamId, 
				name: name, 
				description: description, 
				slots: slots, 
				channel: channel, 
				checkins: [],
			});
			teamList.teams.push(team);
		}

		const updated = await teamList.save(); 
	} catch (err) {
		throw err; 
	}
}

async function editTeam(guildId, teamId, slots, channel, name, description) {
	try {
		const teamList = await getTeamListData(guildId); 
		let existingTeam = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 
		if (existingTeam !== undefined) {
			if (existingTeam.checkins.length > slots) {
				throw TeamError.TEAM_HAS_CHECKINS; 
			}
			existingTeam.name = name; 
			existingTeam.description = description; 
			existingTeam.slots = slots; 
			existingTeam.channel = channel;
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
		await teamList.save(); 
	} catch (err) {
		throw err; 
	}
}

async function editTeamSetting(setting, guildId, teamId, value) {
	try {
		 
		const teamList = await getTeamListData(guildId); 
		let existingTeam = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 
		if (existingTeam !== undefined) {
			let oldValue;
			if (setting === TeamSetting.TEAM_ID) {
				// validate that it doesn't already exist 
				if(teamList.teams.find(team => team.id.toLowerCase() === value.toLowerCase())) {
					throw TeamError.TEAM_ALREADY_EXISTS; 
				}
				oldValue = existingTeam.id; 
				existingTeam.id = value; 
			}
			else if (setting === TeamSetting.SLOTS) {
				if (existingTeam.checkins.length > value) {
					throw TeamError.TEAM_HAS_CHECKINS; 
				}
				oldValue = existingTeam.slots; 
				existingTeam.slots = value; 
			}
			else if (setting === TeamSetting.CHANNEL) {
				oldValue = existingTeam.channel; 
				existingTeam.channel = value;
			}
			else if (setting === TeamSetting.NAME) {
				oldValue = existingTeam.name; 
				existingTeam.name = value; 
			}
			else if (setting === TeamSetting.DESCRIPTION) {
				oldValue = existingTeam.description; 
				existingTeam.description = value; 
			}
			else {
				throw TeamError.INVALID_TEAM_SETTING;
			}
			await teamList.save(); 
			return oldValue;
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
	} catch (err) {
		throw err; 
	}
}

async function removeTeam(guildId, teamId) {
	try {
		const teamList = await getTeamListData(guildId); 
		const teams = teamList.teams; 

		const existingTeamIndex = teams.findIndex(team => team.id.toLowerCase() === teamId.toLowerCase()); 
		if (existingTeamIndex !== -1) {
			const existingTeam = teams[existingTeamIndex]; 

			teams.splice(existingTeamIndex, 1); 
			await teamList.save(); 
			return existingTeam;
		}
		else {
			return TeamError.TEAM_DOES_NOT_EXIST; 
		}
	} catch (err) {
		throw err; 
	}
}

async function checkinTeam(guildId, teamId, user, checkinText, isOther) {
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 

		if (team) {
			const userSelfCheckin = team.checkins.find(checkin => checkin.user === user && !checkin.isOther); 

			// if user already self check in, update description 
			if (userSelfCheckin && !isOther) {
				const oldCheckinText =  userSelfCheckin.checkinText;
				userSelfCheckin.checkinText = checkinText; 
				await teamList.save();
				return {isUpdate: true, oldCheckinText: oldCheckinText};
			}
			else if (team.checkins.length < team.slots) {
				const checkin = Checkin({
					user: user, 
					checkinText: checkinText, 
					isOther: isOther,
				});
				team.checkins.push(checkin);

				await teamList.save();
				return {isUpdate: false, oldCheckinText: undefined};
			}
			else {
				throw TeamError.TEAM_FULL; 
			}
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST;
		}

	} catch (err) {
		console.error(err);
		throw err; 
	}
}

async function checkoutTeam(guildId, teamId, user, number) {
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id.toLowerCase() === teamId.toLowerCase()); 

		if (team) {
			if (number !== undefined) {
				const index = number - 1; 
				// find index and delete 
				if (0 <= index && index < team.checkins.length) {
					const checkin = team.checkins[index];
					team.checkins.splice(index, 1); 
					await teamList.save();
					return checkin;
				} 
				else {
					throw TeamError.CHECKOUT_INVALID_INDEX; 
				}
			}
			else {
				const selfCheckinFilter = checkin => checkin.user === user && !checkin.isOther; 
				const userSelfCheckin = team.checkins.find(selfCheckinFilter); 
				if (userSelfCheckin) {
					const checkinIndex = team.checkins.findIndex(selfCheckinFilter); 
					team.checkins.splice(checkinIndex, 1);
					await teamList.save();
					return userSelfCheckin; 
				}

				// find all user checkins 
				const usersCheckins = team.checkins.filter(checkin => checkin.user === user); 
				if (usersCheckins.length === 0) {
					throw TeamError.USER_NOT_CHECKED_IN; 
				}
				else if (usersCheckins.length > 1) {
					throw TeamError.USER_CHECKED_IN_MULTIPLE; 
				}	
				else {
					throw TeamError.USER_CHECKED_IN_OTHER; 
				}
			}
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
	} catch (err) {
		throw err; 
	}
}

async function clearTeam(guildId, filter) {
	try {
		const teamList = await getTeamListData(guildId); 
		const teams = teamList.teams.filter(filter); 
		if (teams.length === 0) {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
		teams.forEach( team => {
			team.checkins = []; 
		}); 
		await teamList.save(); 
		return teams; 
	} catch (err) {
		throw err; 
	}
}

const TeamError = {
	USER_ALREADY_CHECKED_IN: "USER_ALREADY_CHECKED_IN", 
	TEAM_FULL: "TEAM_FULL", 
	TEAM_ALREADY_EXISTS: "TEAM_ALREADY_EXISTS",
	TEAM_DOES_NOT_EXIST: "TEAM_DOES_NOT_EXIST", 
	CHECKOUT_INVALID_INDEX: "CHECKOUT_INVALID_INDEX",
	USER_NOT_CHECKED_IN: "USER_NOT_CHECKED_IN",
	USER_CHECKED_IN_MULTIPLE: "USER_CHECKED_IN_MULTIPLE", 
	USER_CHECKED_IN_OTHER: "USER_CHECKED_IN_OTHER",
	TEAM_HAS_CHECKINS: "TEAM_HAS_CHECKINS",
	INVALID_TEAM_SETTING: "INVALID_TEAM_SETTING",
};

const TeamSetting = {
	TEAM_ID: "teamid", 
	SLOTS: "slots", 
	NAME: "name", 
	DESCRIPTION: "description", 
	CHANNEL: "channel", 
};

module.exports = {
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
};
