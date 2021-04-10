const { 
    getFameData, 
    addOrUpdateFameEntry, 
    removeFameEntry, 
    clearFameEntries, 
} = require('../src/fame');

const argumentType = {
    help: {
        command: 'help',
        description: 'show help',
    }, 
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
}

// Command Handling 

function help(message, prefix) {
    let description = '**this feature is in beta, don\'t expect it to work well**\nenter daily for free fame! when the contest ends, all the losers fame the winner.';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += `\n\t${prefix}fame ${argumentType[command].command} - ${argumentType[command].description}`;
    }
    message.channel.send(description + '\n' + commandsString);
}

async function view(message) {
    try {
        const entriesText = await getEntriesText(message.guild.id); 
        if (entriesText !== undefined) {
            message.channel.send(entriesText);
        } else {
            message.channel.send('looks like no one has entered yet. higher chance to win if you enter now!');
        }
    } catch (err) {
        throw err; 
    }
}

async function getEntriesText(guildId) {
    try {
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
    } catch (err) {
        throw err; 
    }
}

async function enter(message, ign) {
    if (ign !== undefined) {
        let filter = m => m.author.id === message.author.id;

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
                    message.reply(`entered with \`${ign}\`\n${entriesText}`);
                } 
                else if (existingEntryIgn === ign) {
                    message.reply(`you already entered, dum dum\n${entriesText}`); 
                } 
                else {
                    message.reply(`you already entered with \`${existingEntryIgn}\`. updated your entry with \`${ign}\`.\n${entriesText}`);
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
    try {
        const existingEntryIgn = await addOrUpdateFameEntry(message.guild.id, user, ign);
        return existingEntryIgn; 
    } catch (err) {
        throw err; 
    }
}

async function dropout(message) {
    try {
        const existingEntryIgn = await removeFameEntry(message.guild.id, message.author.id); 
        const entriesText = await getEntriesText(message.guild.id);

        if (existingEntryIgn === undefined) {
            message.reply('you were not entered in the contest, loser' + '\n' + entriesText);
        } else {
            message.reply('you haved dropped out with `' + existingEntryIgn + '`' + '\n' + entriesText);
        }
    } catch (err) {
        throw err; 
    }
}

async function end(message) {
    try {
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
            message.channel.send(summaryText);
        }
        else {
            entriesText = entriesText ? entriesText : '';
            message.channel.send(entriesText + '\n boohoo not enough people entered. everyone loses.');
        }

        await resetEntries(message); 
    } catch (err) {
        throw err; 
    }
}

async function resetEntries(message) {
    try {
        await clearFameEntries(message.guild.id);
    } catch (err) {
        throw err; 
    }
}

module.exports = {
    name: 'fame', 
    description: 'Popularity contest', 
    async execute(message, prefix, args) {
        try {
            console.log('Fame: ' + message.content);

            if (args[0] === argumentType.enter.command) {
                await enter(message, args[1]);
            }
            else if (args[0] === argumentType.dropout.command) {
                await dropout(message);
            }
            // else if (args[0] === argumentType.reset.command) {
            //     message.channel.send('the contest has been reset');
            // }
            else if (args[0] === argumentType.end.command) {
                if (args[1] === 'mynameissandy') {
                    message.delete();
                    await end(message);
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
                await view(message);
            }
            else {
                message.reply('wtf u doin');
            }
        } catch (err) {
            throw err; 
        }
    }
}

