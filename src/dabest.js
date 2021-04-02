const db = require('./database');
const { DaBest } = require('./models/dabest'); 

async function getDaBestData(guildId) {
	try {
		let defaultData = DaBest({ guildId: guildId, user: undefined }); 
		data = await DaBest.findOneAndUpdate(
			{ guildId: guildId }, 
			{ $setOnInsert: defaultData }, 
			{ upsert: true, new: true, runValidators: true },
		);
		return data; 
	} catch (err) {
		throw err; 
	}
}

async function setDaBest(guildId, user) {
	try {
		const data = await getDaBestData(guildId);
		data.user = user;
		const updated = await data.save(); 
	} catch (err) {
		throw err; 
	}
}

async function setNotDaBest(guildId, user) {
	try {
		const data = await getDaBestData(guildId);
		if (data.user === user) {
			data.user = undefined; 
		}
		const updated = await data.save(); 
	} catch (err) {
		throw err; 
	}
}

module.exports = {
	getDaBestData, 
	setDaBest, 
	setNotDaBest, 
}

