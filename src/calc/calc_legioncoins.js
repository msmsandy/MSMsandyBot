const Discord = require('discord.js');

function legioncoins(message, arg) {
	const cp = parseFloat(arg); 

	if (!arg) {
		message.channel.send('u didnt give me your legion cp');
	}
	else if (isNaN(cp)) {
		message.channel.send('u didnt give me a valid legion cp');
	}
	else {
		const coinsPerHour = 1440/1000*cp/24;
		const coinsPerDay = coinsPerHour * 24; 
		const coinsPerWeek = coinsPerDay * 7; 
		const coinsPer30Days = coinsPerDay * 30; 
		const coinsPerYear = coinsPerDay * 365; 

		const title = `Legion Coins`;

		const coinsPerHourDescription = coinsDescription(coinsPerHour, 'hour');
		const coinsPerDayDescription = coinsDescription(coinsPerDay, 'day');
		const coinsPerWeekDescription = coinsDescription(coinsPerWeek, '7 days');
		const coinsPer30DaysDescription = coinsDescription(coinsPer30Days, '30 days');
		const coinsPerYearDescription = coinsDescription(coinsPerYear, 'year');

		let description = `Legion CP: **${formattedNumber(cp * 1000000)}**\n\n${coinsPerHourDescription}\n${coinsPerDayDescription}\n${coinsPerWeekDescription}\n${coinsPer30DaysDescription}\n${coinsPerYearDescription}`;

		let embed = new Discord.MessageEmbed()
			.setColor('#e0c179')
			.setTitle(title)
			.setDescription(description);

		message.channel.send(embed);
	}

}

function coinsDescription(coins, timeString) {
	return `**${formattedNumber(coins)} coins** per ${timeString}`;
}

function formattedNumber(coins) {
	return Math.floor(coins).toLocaleString("en-US");
}

module.exports = {
	legioncoins,
};