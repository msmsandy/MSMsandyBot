const { setDaBest } = require('../src/dabest');

module.exports = {
	name: 'imdabest', 
	description: 'imdabest', 
	private: true,
	async execute(message) {
		try {
			await setDaBest(message.guild.id, message.author.id); 
			message.reply('ya u are!');
		} catch (err) {
			throw err; 
		}
	}
}
