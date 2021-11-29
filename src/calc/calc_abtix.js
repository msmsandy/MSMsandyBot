const Discord = require('discord.js');

function abtix(message, args) {
	const tenMinutes = parseInt(args[0]); 
	const thirtyMinutes = parseInt(args[1]); 
	const oneHour = parseInt(args[2]);
	const wheel = parseInt(args[3]); 

	if (!args[0]) {
		message.channel.send('u didnt give me any values');
	}
	else if (
		!isValidInput(oneHour) ||
		!isValidInput(thirtyMinutes) ||
		!isValidInput(tenMinutes) ||
		!isValidInput(wheel)) 
	{
		message.channel.send('u didnt give me valid values');
	}
	else {
		const total = totalAutobattleMinutes(oneHour, thirtyMinutes, tenMinutes, wheel);

		const title = "Total Auto-Battle"
		const tenMinutesDescription = `10 Min Tickets: \t${tenMinutes ? tenMinutes : 0}`;
		const thirtyMinutesDescription = `30 Min Tickets: \t${thirtyMinutes ? thirtyMinutes : 0}`;
		const oneHourDescription = `1 Hr Tickets: \t${oneHour ? oneHour : 0}`;
		const wheelDescription = `Wheel: \t\t${wheel ? wheel : 0}`;
		const totalDescription = `Total: **${minutesDescription(total)}**`;

		let description = `${tenMinutesDescription}\n${thirtyMinutesDescription}\n${oneHourDescription}\n${wheelDescription}\n\n${totalDescription}`;

		const maxCharge = 999;
		if (total > maxCharge) {
			let overage = total - maxCharge; 
			// overage needs to round up to nearest 10 
			overage = Math.ceil((overage + 1)/ 10) * 10;
			const overageHoursAndMinutes = hoursAndMinutes(overage);

			let overageMinutesDescription = minutesDescription(overage);
			let overageDescription = `Your total exceeds the max charge of ${maxCharge} minutes. To use all your tickets, you must use up ${overageMinutesDescription} of charged auto-battle.`;

			description += `\n\n*${overageDescription}*`;
		}

		let embed = new Discord.MessageEmbed()
			.setTitle(title)
			.setDescription(description); 

		message.channel.send(embed);
	}
}

function isValidInput(value) {
	if (value && (isNaN(value) || value < 0)) {
		return false; 
	}
	return true;
}

function hoursAndMinutes(totalMinutes) {
	const hours = Math.floor(totalMinutes / 60); 
	const minutes = totalMinutes % 60; 
	return {
		hours: hours,
		minutes: minutes,
	}
}

function minutesDescription(totalMinutes) {
	let totalDescription;
	if (totalMinutes >= 60) {
		totalDescription = `${totalMinutes} minutes (${hoursAndMinutesDescription(totalMinutes)})`
	} else {
		totalDescription = `${totalMinutes} minute${totalMinutes == 1 ? '' : 's'}`
	}
	return totalDescription;
}

function hoursAndMinutesDescription(totalMinutes) {
	const totalHoursAndMinutes = hoursAndMinutes(totalMinutes); 
	const hours = totalHoursAndMinutes.hours; 
	const minutes = totalHoursAndMinutes.minutes; 

	let description = [];

	if (hours > 0) {
		description.push(`${hours} hours`);
	}
	if (minutes > 0) {
		description.push(`${minutes} minute${minutes == 1 ? '' : 's'}`);
	}

	return description.join(" and ");
}

function totalAutobattleMinutes(oneHour, thirtyMinutes, tenMinutes, wheel) {
	let minutes = 0; 

	if (oneHour) {
		minutes += oneHour * 60; 
	}
	if (thirtyMinutes) {
		minutes += thirtyMinutes * 30; 
	}
	if (tenMinutes) {
		minutes += tenMinutes * 10; 
	}
	if (wheel) {
		minutes += wheel;
	}

	return minutes
}

module.exports = {
	abtix,
	totalAutobattleMinutes,
};