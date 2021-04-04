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
		return team; 
	} catch (err) {
		console.error(err); 
		throw err; 
	}
}

// returns existing team if it exists 
async function addOrUpdateTeam(guildId, teamId, slots, name, description) {
	try {
		const teamList = await getTeamListData(guildId); 
		
		let existingTeam = teamList.teams.find(team => team.id === teamId); 

		if (existingTeam !== undefined) {
			existingTeam.name = name; 
			existingTeam.description = description; 
			existingTeam.slots = slots; 
		}
		else {
			const team = Team({
				id: teamId, 
				name: name, 
				description: description, 
				slots: slots, 
				checkins: [],
			});
			teamList.teams.push(team);
		}

		const updated = await teamList.save(); 

		return existingTeam; 
	} catch (err) {
		console.error(err);
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
			teams.splice(existingTeamIndex, 1); 

			await teamList.save(); 

			return existingTeam; 
		}
		else {
			return undefined; 
		}
	} catch (err) {
		console.error(err); 
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

async function clearTeam(guildId, teamId) {
	console.log('clearTeam'); 

	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id === teamId); 

		if (team) {
			team.checkins = []; 
			await teamList.save();
		}
		else {
			throw TeamError.TEAM_DOES_NOT_EXIST;
		}
	} catch (err) {
		throw err; 
	}
}

const TeamError = {
	USER_ALREADY_CHECKED_IN: "USER_ALREADY_CHECKED_IN", 
	TEAM_FULL: "TEAM_FULL", 
	TEAM_DOES_NOT_EXIST: "TEAM_DOES_NOT_EXIST", 
	CHECKOUT_INVALID_INDEX: "CHECKOUT_INVALID_INDEX",
	USER_NOT_CHECKED_IN: "USER_NOT_CHECKED_IN",
	USER_CHECKED_IN_MULTIPLE: "USER_CHECKED_IN_MULTIPLE", 
}

module.exports = {
	getTeamListData, 
	getTeam, 
	addOrUpdateTeam, 
	removeTeam, 
	checkinTeam, 
	checkoutTeam, 
	clearTeam, 
	TeamError,
}
