const db = require('./database');
const { Team, TeamList } = require('./models/team'); 

async function getTeamListData(guildId) {
	console.log("Getting Team List Data for " + guildId);

	try {
		const defaultData = Team({ guildId: guildId, teams: [] }); 
		
		const data = await Team.findOneAndUpdate(
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
async function addOrUpdateTeam(guildId, teamId: String, name: String, description: String, slots: Number) {
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
				id: id, 
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

async function checkin(guildId, teamId, user, displayName, signupText) {
	try {
		const teamList = await getTeamListData(guildId); 
		const team = teamList.teams.find(team => team.id === teamId); 

		if (team.checkins.length < team.slots) {
			const checkin = Checkin({
				user: user, 
				displayName: displayName, 
				signupText: signupText, 
			})
			team.checkins.push(checkin);
		}
		else {
			console.log('team is full');
		}
	} catch (err) {
		console.error(err);
		throw err; 
	}
}

async function checkout(guildId, teamId, user: String) {

}

async function checkout(guildId, teamId, index: Number) {

}