const { getDaBestData } = require('../src/dabest');

module.exports = {
	name: 'whosdabest', 
	description: 'whosdabest', 
	async execute(message) {
        try {
    		let daBest = (await getDaBestData(message.guild.id)).user; 

            if (daBest === undefined) {
                message.channel.send('no one...');
            }
            else if (daBest == message.author.id) {
                message.channel.send('you are!');
            }
            else {
                message.channel.send(`<@${daBest}> is!`);
            }
        } catch (err) {
            throw err; 
        }
	}
}
