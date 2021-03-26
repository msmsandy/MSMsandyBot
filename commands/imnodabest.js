module.exports = {
	name: 'imnotdabest', 
	description: 'imnotdabest', 
	execute(message) {
		let daBest = enmap.get(message.guild.id, 'daBest');

		if (message.author.id == daBest) {
			enmap.delete(message.guild.id, 'daBest');
		}

		message.reply('ya ur not');
	}
}