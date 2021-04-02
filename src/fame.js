const db = require('./database');
const { FameEntry, Fame } = require('./models/fame'); 

async function getFameData(guildId) {
	try {
		let defaultFameData = Fame({ guildId: guildId, entries: [] });
		const fameData = await Fame.findOneAndUpdate(
			{ guildId: guildId }, 
			{ $setOnInsert: defaultFameData }, 
			{ upsert: true, new: true, runValidators: true} 
		); 
		return fameData;
	} catch (err) {
		throw err; 
	}
}

// returns existing entry's ign if it already exists 
async function addOrUpdateFameEntry(guildId, user, ign) {
	try {
		let existingEntryIgn = undefined; 
		const fameData = await getFameData(guildId); 
		const entries = fameData.entries; 

		const existingEntry = entries.find(entry => entry.user === user); 
		if (existingEntry !== undefined) {
			existingEntryIgn = existingEntry.ign;
			existingEntry.ign = ign;
		}
		else {
			const fameEntry = FameEntry({ user: user, ign: ign });
			entries.push(fameEntry); 
		}

		const updated = await fameData.save(); 

		return existingEntryIgn; 
	} catch (err) {
		throw err; 
	}
}

async function removeFameEntry(guildId, user) {
	try {
		const fameData = await getFameData(guildId); 
		const entries = fameData.entries; 
		const existingEntryIndex = entries.findIndex(entry => entry.user === user);
		if (existingEntryIndex !== -1) {
			const existingEntry = entries[existingEntryIndex]; 
			entries.splice(existingEntryIndex, 1); 
			await fameData.save(); 
			return existingEntry.ign;
		}
		else {
			return undefined; 
		}
	} catch (err) {
		throw err; 
	}
}

async function clearFameEntries(guildId) {
	try {
		const fameData = await getFameData(guildId); 
		fameData.entries = []; 
		await fameData.save(); 
	} catch(err) {
		throw err; 
	}
}

module.exports = {
	getFameData, 
	addOrUpdateFameEntry, 
	removeFameEntry, 
	clearFameEntries, 
}
