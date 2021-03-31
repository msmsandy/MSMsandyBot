const mongoose = require('mongoose');

let DaBestSchema = new mongoose.Schema({
	guildId: { type: String, require: true, unique: true }, 
	user: String, 
})

const DaBest = mongoose.model('DaBestSchema', DaBestSchema, 'daBest');

module.exports = {
	DaBest,
};
