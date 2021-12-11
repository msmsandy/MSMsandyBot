const { getHelpEmbed } = require('../src/help/help_format');
const { abtix } = require('../src/calc/calc_abtix');
const { legioncoins } = require('../src/calc/calc_legioncoins');

const argumentType = {
	abtix: {
		command: 'abtix', 
		name: 'AB Tickets',
		arguments: '`<10 min tix>` `<30 min tix>` `<1 hr tix>` `<ab wheel>`',
		description: 'calculate how much auto battle you have',
	},
	legioncoins: {
		command: 'legioncoins', 
		name: 'Legion Coins', 
		arguments: '`legion CP in millions`', 
		description: 'calculate how many legion coins you will get',
	},
	help: {
		command: 'help',
		name: 'help',
		arguments: '', 
		description: 'view this',
	},
}

function help(message, prefix) {
	let title = `\`${prefix}calc2\` - calculate stuff`;
	let description = `calculate stuff`;

	let embed = getHelpEmbed(argumentType, title, description);
	message.channel.send(embed);
}

module.exports = {
	name: 'calc2', 
	description: 'Calculate stuff', 
	private: false,
	async execute(message, prefix, args) {
		const firstArg = args[0]; 

		if (firstArg === argumentType.help.command) {
			help(message, prefix);
		}
		else if (firstArg === argumentType.abtix.command) {
			abtix(message, args.slice(1));
		}
		else if (firstArg === argumentType.legioncoins.command) {
			legioncoins(message, args[1]);
		}
		else {
			help(message, prefix);
		}
	}
}
