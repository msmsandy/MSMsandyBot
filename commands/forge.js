const forgeType = {
    necro: {
        name: 'necro',
        rate: 0.04,
    },
    inherit: {
        name: 'inherit',
        rate: 0.30,
    }, 
    any: {
        name: 'any', 
        rate: 0, 
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

function successString(type, name) {
    if (name === undefined) {
        name = `nothing`; 
    }
    switch (type) {
        case forgeType.necro: 
            return `successfully crafted **necro ${name}**`; 
        case forgeType.inherit: 
            return `successfully crafted **ancient ${name}**`; 
        case forgeType.any: 
            return `passed **${name}**`; 
    }
}

function failureString(type) {
    switch (type) {
        case forgeType.necro: 
        case forgeType.inherit: 
            return `crafting failed`; 
        case forgeType.any: 
            return `forging failed`; 
    }
}

function forge(message, type, bonus, name) {
    let result = Math.random();
    let successRate = type.rate; 

    if (bonus) {
        successRate += Math.floor(bonus) / 100.0; 
    }

    if (result <= successRate) {
        const string = successString(type, name); 
        message.channel.send(`<@${message.author.id}> ${string} with a success rate of ${successRate * 100.0}%`);
    }
    else {
        const string = failureString(type);
        message.channel.send(`${string} with a success rate of ${successRate * 100}%`);
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
            forge(message, forgeType.necro, bonus, name);
        }
        else if (type === forgeType.inherit.name) {
            forge(message, forgeType.inherit, bonus, name);
        }
        else if (type === forgeType.any.name) {
            forge(message, forgeType.any, bonus, name);
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
