const { 
    getFameData, 
    addOrUpdateFameEntry, 
    removeFameEntry, 
    clearFameEntries, 
} = require('../src/fame');

const argumentType = {
    view: {
        command: 'view', 
        description: 'view current contest'
    },
    enter : {
        command: 'enter', 
        arguments: 'character name',
        description: 'enter the contest with the character you want famed',
    },
    dropout: {
        command: 'dropout',
        description: 'drop out of the contest', 
    }, 
    // reset: {
    //     command: 'reset',
    //     description: 'reset the contest', 
    // }, 
    end: {
        command: 'end',
        description: '**only for sandy\'s use!!!** end the contest to choose a winner', 
    }, 
    // stats: {
    //     command: 'stats',
    //     description: 'show your fame contest stats', 
    // }, 
    help: {
        command: 'help',
        description: 'show help',
    }, 
}

// Command Handling 

function help(message, prefix) {
    let description = '**this feature is in beta, don\'t expect it to work well**\nenter daily for free fame! when the contest ends, all the losers fame the winner.';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += '\n\t' + prefix + 'fame ' + argumentType[command].command + ' - ' + argumentType[command].description; 
    }
    message.channel.send(description + '\n' + commandsString);
}

async function view(message) {
    const entriesText = await getEntriesText(message.guild.id); 
    if (entriesText !== undefined) {
        message.channel.send(entriesText);
    } else {
        message.channel.send('looks like no one has entered yet. higher chance to win if you enter now!');
    }
}

async function getEntriesText(guildId) {
    const fameData = await getFameData(guildId);

    let entries = fameData.entries; 
    console.log(entries);
    if (entries.length > 0) {
        let entriesText = '';
        for (var i = 0; i < entries.length; i++) {
            const entry = entries[i]; 
            entriesText += `\n${i+1}. ${entry.ign}`;
        }
        console.log(entriesText);
        return `entries: \`\`\`${entriesText}\`\`\``; 
    }
    else {
        return undefined;
    }
}

async function enter(message, ign) {
    if (ign !== undefined) {
        let filter = m => m.author.id === message.author.id

        try {
            await message.reply('by entering, you agree to fame the winner within 24 hours if you lose. do you accept these terms? enter `y` or `n`'); 

            let responseMessage = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 30000,
                errors: ['time']
            });

            responseMessage = responseMessage.first(); 

            if (responseMessage.content.toLowerCase() === 'y') {
                const existingEntryIgn = await updateEntries(message, message.author.id, ign);
                const entriesText = await getEntriesText(message.guild.id);
                if (existingEntryIgn === undefined) {
                    message.reply('entered with `' + ign + '`' + '\n' + entriesText);
                } 
                else if (existingEntryIgn === ign) {
                    message.reply('you already entered, dum dum' + '\n' + entriesText); 
                } 
                else {
                    message.reply('you already entered with `' + existingEntryIgn + '`. updated your entry with `' + ign + '`.' + '\n' + entriesText);
                }
            }
            else if (message.content.toLowerCase() === 'n') {
                message.reply('you have not been entered into the contest');
            }
            else {
                message.reply('thats not what i asked for');
            }
        } catch (err) {
            console.log(err);
            message.reply('you took too long');
        }
    }
    else {
        message.reply('u need to provide a character to fame if u win');
    }
}

async function updateEntries(message, user, ign) {
    const existingEntryIgn = await addOrUpdateFameEntry(message.guild.id, user, ign);
    return existingEntryIgn; 
}

async function dropout(message) {
    const existingEntryIgn = await removeFameEntry(message.guild.id, message.author.id); 
    const entriesText = await getEntriesText(message.guild.id);

    if (existingEntryIgn === undefined) {
        message.reply('you were not entered in the contest, loser' + '\n' + entriesText);
    } else {
        message.reply('you haved dropped out with `' + existingEntryIgn + '`' + '\n' + entriesText);
    }
}

async function end(message) {
    const fameData = await getFameData(message.guild.id);
    const entries = fameData.entries; 
    let entriesText = await getEntriesText(message.guild.id); 

    if (entries.length >= 2) {

        const winningNumber = Math.floor(Math.random() * entries.length); 
        const winningEntry = entries[winningNumber]; 
        const losingEntries = entries.filter(entry => entry.user !== winningEntry.user); 

        const winnerText = `winner: <@${winningEntry.user}>`;
        const winnerCharText = `winning character: \`${winningEntry.ign}\``; 
        const loserText = 'losers: ' + losingEntries.map(entry => `<@${entry.user}>`).join(', ');

        const summaryText = `${entriesText}\nthe contest has ended. congratulations to the winner. losers, please fame the winner's character within 24 hours or suffer the consequences.\n\t${winnerText}\n\t${winnerCharText}\n\t${loserText}`; 
    }
    else {
        entriesText = entriesText ? entriesText : '';
        message.channel.send(entriesText + '\n boohoo not enough people entered. everyone loses.');
    }

    await resetEntries(message); 
}

async function resetEntries(message) {
    await clearFameEntries(message.guild.id); 
}

module.exports = {
    name: 'fame2', 
    description: 'Popularity contest', 
    execute(message, prefix, args) {
        console.log('Fame2: ' + message.content);

        if (args[0] === argumentType.enter.command) {
            enter(message, args[1]);
        }
        else if (args[0] === argumentType.dropout.command) {
            dropout(message);
        }
        // else if (args[0] === argumentType.reset.command) {
        //     message.channel.send('the contest has been reset');
        // }
        else if (args[0] === argumentType.end.command) {
            if (args[1] === 'mynameissandy') {
                end(message);
            } else {
                message.reply('you\'re banned!');
            }
        }
        // else if (args[0] === argumentType.stats.command) {
        //     message.reply('you have entered X times and won X times');
        // }
        else if (args[0] === argumentType.help.command) {
            help(message, prefix);
        }
        else if (args[0] === argumentType.view.command) {
            view(message);
        }
        else {
            message.reply('wtf u doin');
        }
    }
}

