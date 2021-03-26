module.exports = {
	name: 'whosdabest', 
	description: 'whosdabest', 
	execute(message) {
		let daBest = enmap.get(message.guild.id, 'daBest');
        if (daBest === undefined) {
            message.channel.send('no one...');
        }
        else if (daBest == message.author.id) {
            message.channel.send('you are!');
        }
        else {
            message.channel.send('<@' + daBest + '> is!');
        }
	}
}