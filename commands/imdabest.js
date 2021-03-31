const { setDaBest } = require('../src/dabest');

module.exports = {
	name: 'imdabest', 
	description: 'imdabest', 
	async execute(message) {
		await setDaBest(message.guild.id, message.author.id); 
		message.reply('ya u are!');
	}
}
