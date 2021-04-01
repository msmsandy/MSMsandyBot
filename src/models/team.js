const mongoose = require('mongoose');

let CheckinSchema = new mongoose.Schema({
	user: { type: String, unique: true }, 
	displayName: { type: String }, 
	signupText: { type: String }, 
});

let TeamSchema = new mongoose.Schema({
	id: { type: String, unique: true }, 
	name: { type: String }, 
	description: { type: String },
	slots: { type: Number }, 
	checkins: [CheckinSchema], 
});

let TeamListSchema = new mongoose.Schema({
	guildId: { type: String, require: true, unique: true }, 
	teams: [TeamSchema],  
});

const Checkin = mongoose.model('CheckinSchema', CheckinSchema, 'checkinSchema');
const Team = mongoose.model('TeamSchema', TeamSchema, 'teamSchema'); 
const TeamList = mongoose.model('TeamListSchema', TeamListSchema, 'teamListSchema'); 

module.exports = {
	Checkin, 
	Team, 
	TeamList,
};