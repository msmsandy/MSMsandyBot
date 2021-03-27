const argumentType = {
    view: {
        command: '', 
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
    reset: {
        command: 'reset',
        description: 'reset the contest', 
    }, 
    end: {
        command: 'end',
        description: 'end the contest to choose a winner', 
    }, 
    stats: {
        command: 'stats',
        description: 'show your fame contest stats', 
    }, 
    help: {
        command: 'help',
        description: 'show help',
    }, 
}

const contestEntriesKey = 'fameContestEntries';

// Command Handling 

function help(message, prefix) {
    let description = 'enter daily for free fame! when the winner is announced, all the losers fame the winner.';
    let commandsString = 'commands:';
    for (const command in argumentType) {
        commandsString += '\n\t' + prefix + 'fame ' + argumentType[command].command + ' - ' + argumentType[command].description; 
    }
    message.channel.send(description + '\n' + commandsString);
}

function view(message) {
    const entries = enmap.get(message.guild.id, contestEntriesKey); 
    if (entries.length > 0) {
        let entriesText = '';
        for (var i = 0; i < entries.length; i++) {
            const entry = entries[i]; 
            entriesText += '\n' + (i + 1) + '. ' + entry.ign;
        }
        message.channel.send('current entries: ```' + entriesText + '```');
    }
    else {
        message.channel.send('looks like no one has entered yet. higher chance to win if you enter now!');
    }
}

function enter(message, ign) {
    if (ign !== undefined) {
        let filter = m => m.author.id === message.author.id
        message.reply('by entering, you agree to fame the winner within 24 hours if you lose. do you accept these terms? enter `y` or `n`').then(() => {
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 30000,
                errors: ['time']
            })
            .then(message => {
                message = message.first(); 

                if (message.content.toLowerCase() === 'y') {
                        const existingEntryIgn = enterContest(message.guild.id, message.author.id, ign); 

                        if (existingEntryIgn === undefined) {
                            message.reply('entered with `' + ign + '`');
                        } 
                        else if (existingEntryIgn === ign) {
                            message.reply('you already entered, dum dum'); 
                        } 
                        else {
                            message.reply('you already entered with `' + existingEntryIgn + '`. updated your entry with `' + ign + '`.');
                        }
                    }
                    else if (message.content.toLowerCase() === 'n') {
                        message.reply('you have not been entered into the contest');
                    }
                    else {
                        message.reply('thats not what i asked for');
                    }
                }).catch(collected => {
                    console.log(collected);
                    message.reply('you took too long');
                });
            });
    }
    else {
        message.reply('u need to provide a character to fame if u win');
    }
}

function dropout(message) {
    // remove userid from db 
    const ign = dropoutContest(message.guild.id, message.author.id); 
    console.log(enmap.get(message.guild.id, contestEntriesKey));
    if (ign === undefined) {
        message.reply('you were not entered in the contest, loser');
    } else {
        message.reply('you haved dropped out with `' + ign + '`');
    }
}

// Model updates 

function enterContest(guild, user, ign) {
    const entry = { user: user, ign: ign };

    enmap.ensure(guild, [], contestEntriesKey);

    // if user already has an entry, remove first 
    const existingEntry = enmap.get(guild, contestEntriesKey).find(entry => entry.user === user); 
    if (existingEntry !== undefined) {
        enmap.remove(guild, existingEntry, contestEntriesKey);
        enmap.push(guild, entry, contestEntriesKey);
        return existingEntry.ign; 
    }
    else {
        enmap.push(guild, entry, contestEntriesKey);
        return undefined; 
    }
}

function dropoutContest(guild, user) {
    const entry = enmap.get(guild, contestEntriesKey).find(entry => entry.user === user); 
    if (entry !== undefined) {
        enmap.remove(guild, entry, contestEntriesKey);
        return entry.ign;
    }
    return undefined; 
}

module.exports = {
    name: 'fame', 
    description: 'Popularity contest', 
    execute(message, prefix, args) {
        console.log('Fame: ' + message.content);
        console.log(enmap.get(message.guild.id, contestEntriesKey));

        if (args[0] === argumentType.enter.command) {
            enter(message, args[1]);
        }
        else if (args[0] === argumentType.dropout.command) {
            dropout(message);
        }
        else if (args[0] === argumentType.reset.command) {
            message.channel.send('the contest has been reset');
        }
        else if (args[0] === argumentType.end.command) {
            message.channel.send('the contest has ended. the winner is');
        }
        else if (args[0] === argumentType.stats.command) {
            message.reply('you have entered X times and won X times');
        }
        else if (args[0] === argumentType.help.command) {
            help(message, prefix);
        }
        else if (args[0] === undefined) {
            view(message);
        }
        else {
            message.reply('wtf u doin');
        }
    }
}

