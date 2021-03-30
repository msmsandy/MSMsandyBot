const mongoose = require('mongoose');
require('dotenv').config(); 

const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const server = process.env.MONGODB_SERVER;
const database = process.env.MONGODB_DATABASE;
const uri = `mongodb+srv://${user}:${password}@${server}/${database}`; 

class Database {
	constructor() {
		this._connect(); 
	}

	_connect() {
		// console.log('connection to: ' + uri); 
		mongoose.connect(uri)
			.then(() => {
				console.log('Database connection successful'); 
			})
			.catch(err => {
				console.log('Database connection error' + err);
			})
	}

}

module.exports = new Database();