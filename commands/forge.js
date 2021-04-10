const forgeType = {
    necro: {
        name: 'necro',
        rate: 0.04,
    },
    inherit: {
        name: 'inherit',
        rate: 0.30,
    }
};

function help(message) {
    let header = `**forge**`;
    let forgeList = `here's what you can forge:`;
    for (const type in forgeType) {
        forgeList += `\n\t- ${forgeType[type].name} (${forgeType[type].rate * 100}%)`;
    }
    let howTo = `!forge \`<type>\` \`<optional: bonus>\` \`<item name>\``;
    message.channel.send(`${header}\n\n${forgeList}\n\n${howTo}`);
}

function mastercraft(message, type, bonus, name) {
    let result = Math.random();
    let successRate = type === forgeType.necro ? forgeType.necro.rate : forgeType.inherit.rate; 

    if (bonus) {
        successRate += bonus / 100; 
    }

    console.log(`mastercraft: ${result} <= ${successRate}, bonus: ${bonus}`);
    if (result <= successRate) {
        const typeName = type === forgeType.necro ? 'necro' : 'ancient'; 

        const resultName = name ? `${name}` : `nothing`; 
        message.channel.send(`<@${message.author.id}> successfully crafted **${typeName} ${resultName}** with a success rate of ${successRate * 100}%`);
    }
    else {
        message.channel.send(`crafting failed with a success rate of ${successRate * 100}%`);
    }
}

module.exports = {
	name: 'forge', 
	description: 'forge', 
	execute(message, args) {
        const type = args[0];
        args = args.slice(1);

        let bonus; 
        if (args[0] && !isNaN(args[0])) {
            bonus = args[0];
            args = args.slice(1);
        }

        const name = args.join(' ');

        if (type === forgeType.necro.name) {
            mastercraft(message, forgeType.necro, bonus, name);
        }
        else if (type === forgeType.inherit.name) {
            mastercraft(message, forgeType.inherit, bonus, name);
        }
        else if (type === undefined) {
            message.reply(`wat u forging bro`);
        }
        else if (type === 'help') {
            help(message);
        }
        else if (type && name) {
            const secondSentence = name ? `take your ${name} somewhere else.` : ''; 
            message.channel.send(`i can't forge ${type} yet. ${secondSentence}`);
        }
	}
}
