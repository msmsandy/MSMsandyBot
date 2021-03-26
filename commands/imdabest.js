module.exports = {
	name: 'imdabest', 
	description: 'imdabest', 
	execute(message) {
		enmap.set(message.guild.id, message.author.id, 'daBest');

		message.reply('ya u are!');
	}
}