const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId; 

let FameEntrySchema = new mongoose.Schema({
	user: {
		type: String, 
	},
	ign: String,
});

let FameSchema = new mongoose.Schema({
	guildId: { type: String, required: true, unique: true }, 
	entries: [FameEntrySchema],
});

const FameEntry = mongoose.model('FameEntry', FameEntrySchema, 'fameEntries');
const Fame = mongoose.model('Fame', FameSchema, 'fames');

module.exports = {
	FameEntry, 
	Fame,
}