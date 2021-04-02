const { setNotDaBest } = require('../src/dabest');

module.exports = {
	name: 'imnotdabest', 
	description: 'imnotdabest', 
	async execute(message) {
		try {
			await setNotDaBest(message.guild.id, message.author.id); 
			message.reply('ya ur not');
		} catch (err) {
			throw err; 
		}
	}
}
