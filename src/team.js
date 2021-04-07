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

		console.log(data);
		return data; 
	} catch (err) {
		console.error(err);
		throw err; 
	}
}

async function getTeam(guildId, teamId) {
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id === teamId); 
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
		
		let existingTeam = teamList.teams.find(team => team.id === teamId); 

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
		let existingTeam = teamList.teams.find(team => team.id === teamId); 
		if (existingTeam !== undefined) {
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
		let existingTeam = teamList.teams.find(team => team.id === teamId); 
		if (existingTeam !== undefined) {
			let oldValue;
			if (setting === TeamSetting.TEAM_ID) {
				oldValue = existingTeam.id; 
				existingTeam.id = value; 
			}
			else if (setting === TeamSetting.SLOTS) {
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

		const existingTeamIndex = teams.findIndex(team => team.id === teamId); 
		if (existingTeamIndex !== -1) {
			const existingTeam = teams[existingTeamIndex]; 

			if (existingTeam.checkins.length === 0) {
				teams.splice(existingTeamIndex, 1); 
				await teamList.save(); 
				return existingTeam; 
			}
			else {
				throw TeamError.TEAM_HAS_CHECKINS;
			}
		}
		else {
			return TeamError.TEAM_DOES_NOT_EXIST; 
		}
	} catch (err) {
		throw err; 
	}
}

async function checkinTeam(guildId, teamId, user, checkinText) {
	console.log('checkinTeam');
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id === teamId); 

		if (team) {
			const userCheckin = team.checkins.find(checkin => checkin.user === user && checkin.checkinText === checkinText); 
			if (userCheckin) {
				throw TeamError.USER_ALREADY_CHECKED_IN; 
			}
			else if (team.checkins.length < team.slots) {
				const checkin = Checkin({
					user: user, 
					checkinText: checkinText, 
				});
				team.checkins.push(checkin);

				await teamList.save();
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

async function checkoutTeam(guildId, teamId, user, index) {
	console.log('checkoutTeam'); 

	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id === teamId); 

		if (team) {
			if (index !== undefined) {
				// find index and delete 
				if (0 <= index && index < team.checkins.length) {
					team.checkins.splice(index, 1); 
				} 
				else {
					throw TeamError.CHECKOUT_INVALID_INDEX; 
				}
			}
			else {
				// find all user checkins 
				const usersCheckins = team.checkins.filter(checkin => checkin.user === user); 
				if (usersCheckins.length === 0) {
					throw TeamError.USER_NOT_CHECKED_IN; 
				}
				else if (usersCheckins.length > 1) {
					throw TeamError.USER_CHECKED_IN_MULTIPLE; 
				}	
				else {
					const checkinIndex = team.checkins.find(checkin => checkin.user === user); 
					team.checkins.splice(checkinIndex, 1); 
				}
			}
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST; 
		}
		await teamList.save();
	} catch (err) {
		throw err; 
	}
}

async function clearTeam(guildId, filter) {
	console.log('clearTeam'); 

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
	TEAM_HAS_CHECKINS: "TEAM_HAS_CHECKINS",
	INVALID_TEAM_SETTING: "INVALID_TEAM_SETTING",
}

const TeamSetting = {
	TEAM_ID: "teamid", 
	SLOTS: "slots", 
	NAME: "name", 
	DESCRIPTION: "description", 
	CHANNEL: "channel", 
}

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
}
