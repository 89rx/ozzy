import { SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';


const WEAPONS = {
    coconut: {
        name: 'coconut',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered Desireus' coconuts!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws a coconut at <@${target.id}> with incredible force, dealing ${damage} damage!`
                : `<@${attacker.id}> throws a coconut at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    axe: {
        name: 'axe',
        damage: (round, isCritical) => {
            const base = 4 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a mighty axe!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the axe at <@${target.id}> with devastating force, dealing ${damage} damage!`
                : `<@${attacker.id}> swings the axe at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    pistol: {
        name: 'pistol',
        damage: (round, isCritical) => {
            const base = 5 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a pistol!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> fires the pistol at <@${target.id}> with deadly accuracy, dealing ${damage} damage!`
                : `<@${attacker.id}> fires the pistol at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    cookies: {
        name: 'cookies',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a bag of cookies!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws cookies at <@${target.id}> with surprising force, dealing ${damage} damage!`
                : `<@${attacker.id}> throws cookies at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    excalibur: {
        name: 'Excalibur',
        damage: (round, isCritical) => {
            const base = 6 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the legendary sword Excalibur!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strikes with Excalibur at <@${target.id}>, dealing ${damage} damage with a mighty blow!`
                : `<@${attacker.id}> strikes at <@${target.id}> with Excalibur, dealing ${damage} damage.`;
        }
    },

    bow: {
        name: 'bow',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a bow!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> shoots an arrow from the bow at <@${target.id}>, dealing ${damage} damage with deadly precision!`
                : `<@${attacker.id}> shoots an arrow at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    mace: {
        name: 'mace',
        damage: (round, isCritical) => {
            const base = 4 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a heavy mace!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the mace at <@${target.id}>, dealing ${damage} damage with a crushing blow!`
                : `<@${attacker.id}> swings the mace at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    rat: {
        name: 'rat',
        damage: (round, isCritical) => {
            const base = 1 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a rat!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> unleashes a rat at <@${target.id}>, dealing ${damage} damage with a vicious bite!`
                : `<@${attacker.id}> sends a rat at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    blueguitar: {
        name: 'blue guitar',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a blue guitar!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strums the blue guitar at <@${target.id}>, dealing ${damage} damage with a rockin' riff!`
                : `<@${attacker.id}> throws the blue guitar at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    banhammer: {
        name: 'banhammer',
        damage: (round, isCritical) => {
            const base = 10 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the legendary banhammer!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the banhammer at <@${target.id}>, dealing ${damage} damage with a thunderous strike!`
                : `<@${attacker.id}> swings the banhammer at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    javascript: {
        name: 'JavaScript',
        damage: (round, isCritical) => {
            const base = 7 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the power of JavaScript!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> unleashes a JavaScript attack on <@${target.id}>, dealing ${damage} damage with a powerful script!`
                : `<@${attacker.id}> attacks <@${target.id}> with JavaScript, dealing ${damage} damage.`;
        }
    },

    slipper: {
        name: 'slipper',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a slipper!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws a slipper at <@${target.id}>, dealing ${damage} damage with a swift kick!`
                : `<@${attacker.id}> throws a slipper at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    metronome: {
        name: 'metronome',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a metronome!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strikes with the metronome at <@${target.id}>, dealing ${damage} damage with perfect timing!`
                : `<@${attacker.id}> attacks <@${target.id}> with the metronome, dealing ${damage} damage.`;
        }

    },

    pinklightsaber: {
        name: 'pink lightsaber',
        damage: (round, isCritical) => {
            const base = 8 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a pink lightsaber!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the pink lightsaber at <@${target.id}>, dealing ${damage} damage with a graceful strike!`
                : `<@${attacker.id}> attacks <@${target.id}> with the pink lightsaber, dealing ${damage} damage.`;
        }
    },

    bananapeellauncher: {
        name: 'bananapeellauncher',
        damage: (round, isCritical) => {
            const base = 6 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a banana peeler launcher!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> launches a banana peeler at <@${target.id}>, dealing ${damage} damage with a slippery surprise!`
                : `<@${attacker.id}> launches a banana peeler at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    masterball: {
        name: 'Master Ball',
        damage: (round, isCritical) => {
            const base = 10 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a Master Ball!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws the Master Ball at <@${target.id}>, dealing ${damage} damage with a legendary capture!`
                : `<@${attacker.id}> throws the Master Ball at <@${target.id}>, dealing ${damage} damage.`;
        }
    },
};


const joinEmoji = '🏹';
const startEmoji = '⚔️';
const addOzzyEmoji = '🗡';

//initializing game files

// allowed roles who can do the command
const allowedRoles = ['1388586562245230752'];
let workingHG = false;

// game state variables

const players = new Map();
const alivePlayers = new Set();
let hoster = "";
let finish = false;
let arenaMsg = "";
let ozzyJoined = false;
let hasStart = false;
let fight = "";
let nightFight = "";

// UI components

const createButtons = () => ({
    next: new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary),
    nextDisabled: new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
});

const main = new ActionRowBuilder()
    .addComponents(createButtons().next);
const done = new ActionRowBuilder()
    .addComponents(createButtons().nextDisabled); 

class Player {
    constructor(id, avatarURL) {
        this.id = id;
        this.avatar = avatarURL;
        this.health = 100;
        this.alive = true;
        this.weapons = new Set();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) this.alive = false;
    }

    equipWeapon(weapon) {
        this.weapons.add(weapon);
    }
};

class GameState {
    constructor(hoster) {
        this.hoster = hoster;
        this.players = new Map();
        this.phase = 'lobby';
        this.round = 1;
        this.messages = {
            lobby: null,
            current: null,
            previous: null

        };
        this.collectors = [];
        this.cleanupCallbacks = [];
    }

    async transitionTo(phaseName, interaction) {
        this.cleanup();
        this.phase = phaseName;
    
        return new Promise((resolve, reject) => {
            // 1. Set phase timeout
            const phaseTimeout = setTimeout(() => {
                reject(new Error(`${phaseName} phase timed out`));
            }, GAME_EVENTS[phaseName].duration);
    
            // 2. Execute phase with cleanup
            GAME_EVENTS[phaseName].execute(this, interaction)
                .then(() => {
                    clearTimeout(phaseTimeout);
                    resolve();
                })
                .catch(error => {
                    clearTimeout(phaseTimeout);
                    reject(error);
                });
    
            // 3. Store for emergency cleanup
        });
    }

    registerCleanup(callback) {
        this.cleanupCallbacks.push(callback);
    }
    
    cleanup() {
        // 1. Stop all collectors
        this.collectors.forEach(c => c.stop());
        
        // 2. Execute registered callbacks
        this.cleanupCallbacks.forEach(cb => cb());
        
        // 3. Reset
        this.collectors = [];
        this.cleanupCallbacks = [];
    }

    checkWinner() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);
        if (alivePlayers.length === 1) {
            return alivePlayers[0];
        } else if (alivePlayers.length === 0) {
            return null; // No winner, all players are dead
        }
        return null; // More than one player alive, no winner yet
    }
    
    
};

const OZZY_ID = '1253478821974245506';
let weaponAssignments =[];
let casualties = [];

const GAME_EVENTS = {

    
    lobby: {
        duration: 300000, // 5 minutes
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {

                    console.log("Starting lobby phase...");


                    const startEmbed = new EmbedBuilder()
                    .setTitle("Hunger Games")
                    .setDescription(
                        `The Reaping\nHosted by: <@${game.hoster}>\n\n` +
                        `React with ${joinEmoji} to **Participate**\n\n` +
                        `React with ${addOzzyEmoji} to **Add Ozzy**\n\n` +
                        `React with ${startEmoji} to **Begin**`
                    )
                    .setColor(0x953d59);

                    console.log("Creating lobby message...");

                    const testaaa = await interaction.followUp({embeds: [startEmbed]}, { fetchReply: true });

                    console.log("Lobby message created, adding reactions...");
                        
                    
                        testaaa.react(joinEmoji);
                        testaaa.react(addOzzyEmoji);
                        testaaa.react(startEmoji);
                    

                    console.log("Reactions added, setting up collectors...");
        
                    // 4. Setup timeout rejection
                    /*const timeout = setTimeout(() => {
                        reject(new Error('Lobby timed out'));
                    }, GAME_EVENTS.lobby.duration);
                    game.registerCleanup(() => {
                        console.log("Cleaning up lobby phase...");
                        clearTimeout(timeout)});*/

                    console.log("Setting up collectors...");

                    const joinFilter = (reaction, user) => {
                        return reaction.emoji.name === "ðŸ¹" && !user.bot;
                    };
                    const ozzyFilter = (reaction, user) => {
                        return reaction.emoji.name === "ðŸ—¡" && !user.bot && user.id === game.hoster;
                    };
                    const startFilter = (reaction, user) => {
                        return reaction.emoji.name === "âš”ï¸" && !user.bot && user.id === game.hoster;
                    };    

                    console.log("Set up filters, creating collectors...");

                    const joinCollector = testaaa.createReactionCollector({ filter: joinFilter, time: 300000 });
                    joinCollector.on("collect", async (r, u) => {
                        console.log(`It's begun`);
                        if (!game.players.has(u.id)) {
                            console.log(`Player <@${u.id}> joined the game.`);
                            game.players.set(u.id, new Player(u.id, u.displayAvatarURL()));
                            console.log(`Player <@${u.id}> joined the game.`);
                            //GAME_EVENTS.lobby.updateLobbyMessage(game, testaaa);
                        }
                    });



                    
                    game.collectors = [
                        // Join collector

                        testaaa.createReactionCollector({ filter: ozzyFilter, time: 300000 })
                        .on('collect', () => {
                            if (!game.players.has(OZZY_ID)) {
                                game.players.set(OZZY_ID, new Player(OZZY_ID, "https://i.imgur.com/HOVguxl.jpeg"));
                                //GAME_EVENTS.lobby.updateLobbyMessage(game, testaaa);
                            }
                        }),

                        testaaa.createReactionCollector({
                            filter: startFilter,
                            time: 300000
                        }).on('collect', async () => {
                            try{
                                if (game.players.size >= 2) {
                                    // Freeze the lobby message (disable components)
                                    await testaaa.edit({
                                        components: [done] // Uses the disabled button state
                                    });

                                    // Create a NEW message for the game start
                                    const startAnnounce = new EmbedBuilder()
                                        .setTitle("âš”ï¸ Hunger Games Begin âš”ï¸")
                                        .setDescription("Tributes enter the arena...")
                                        .setColor(0x953d59);
                                    
                                    await interaction.followUp({ embeds: [startAnnounce] });
                                    
                                    // Proceed to cornucopia with new message reference
                                    await game.transitionTo('cornucopia', interaction);

                                    resolve();
                                }


                                
                                
                            } catch (error) {
                                console.error("Error starting game:", error);
                                reject(error);
                                game.cleanupCollectors();
                            }
                        })


                    ];
                } catch (error) {
                    reject(error);
                }    
            });
        },


        /*updateLobbyMessage: (game, message) => {
            console.log("Updating lobby message...");
            try {
                const playerList = Array.from(game.players.values())
                    .map(p => `<@${p.id}>`)
                    .join('\n');
                
                const embed = new EmbedBuilder()
                    .setTitle(`Lobby (${game.players.size}/24)`)
                    .setDescription(
                        `Host: <@${game.hoster}>\n\n` +
                        `**Players**:\n${playerList || "None"}\n\n` +
                        `${joinEmoji} Join | ${startEmoji} Begin`
                    )
                    .setColor(0x953d59);

                message.edit({
                    embeds: [embed],
                });
                console.log("Lobby message updated successfully.");
            } catch (error) {
                console.error("Error updating lobby message:", error);
            }    
        },*/
        transitions: {
            start: 'cornucopia'
        }
    },


    cornucopia: {
        duration: 60000,
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {
                    // Weapon distribution
                    weaponAssignments = [];
                    casualties = [];
                    const weaponKeys = Object.keys(WEAPONS);
                    game.players.forEach(player => {
                        const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                        weaponAssignments.push(selectedWeapon.discovery(player));
                        player.takeDamage(selectedWeapon.damage(game.round, false));
                        player.equipWeapon(selectedWeapon);
                        if (!player.alive) casualties.push(`âœï¸ <@${player.id}>`);
                    });

                    const cornucopiaEmbed = new EmbedBuilder().setDescription(weaponAssignments.join('\n'));
    
                    // Create embed
                    game.messages.current = await interaction.followUp({
                        embeds: [cornucopiaEmbed],
                        components: [main],
                        fetchReply: true
                    });
    
                    // Timeout
                    const timeout = setTimeout(() => 
                        reject(new Error('Timeout')), GAME_EVENTS.cornucopia.duration);
                    game.registerCleanup(() => clearTimeout(timeout));
    
                    // Next button
                    const collector = game.messages.current.createMessageComponentCollector({
                        filter: i => i.user.id === game.hoster,
                        time: GAME_EVENTS.cornucopia.duration
                    }).on('collect', async i => {
                        if (i.customId === 'next') {
                            await i.deferUpdate();
                            collector.stop();

                            game.messages.current.edit({
                                embeds: [cornucopiaEmbed],
                                components: [done]
                            });

                            

                            await game.transitionTo('day', interaction); // Critical line
                            resolve();
                        }
                    });
    
                    game.collectors.push(collector);
                } catch (error) {
                    game.cleanup();
                    reject(error);
                }
            });
        },
        transitions: {
            next: 'day'
        }
    },

    day: {
        duration: 60000,
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const winner = game.checkWinner();
                    if (winner) return game.transitionTo('winner', interaction);

                    game.round++;

                    const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                    
                    let roundChoice = getRandomInt(5);

                    if(alivePlayers.length <=2){
                        // end game logic

                        let fightLog = [];
                        
                        const [player1, player2] = alivePlayers;
                        let currentAttacker = player1;
                        let currentDefender = player2;

                        // Battle loop until one dies
                        while (player1.alive && player2.alive) {
                            if (currentAttacker.weapons.size > 0) {
                                const weapons = Array.from(currentAttacker.weapons);
                                const weapon = weapons[Math.floor(Math.random() * weapons.length)];
                                fightLog.push(weapon.attack(currentAttacker, currentDefender, game.round));
                                
                                if (!currentDefender.alive) {
                                    fightLog.push(`\nðŸ† <@${currentAttacker.id}> wins the Hunger Games!`);
                                    break;
                                }
                            } else {
                                fightLog.push(`<@${currentAttacker.id}> fumbles with no weapons!`);
                            }

                            // Switch attacker/defender for next round
                            [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
                        }
                        
                        const finalShowdown = new EmbedBuilder()
                            .setTitle(`Final Showdown - Day ${game.round}`)
                            .setDescription(fightLog.join('\n'))
                            .setColor(0x953d59)
                            .setFooter({ text: 'The Hunger Games have ended!' });

                        await interaction.followUp({
                            embeds: [finalShowdown],
                            components: [done]
                        });
                        
                        await game.transitionTo('winner', interaction);
                        resolve();
                        


                    }

                    else if(roundChoice < 2) {
                        // single player fights

                        weaponAssignments = [];
                        casualties = [];
                        const weaponKeys = Object.keys(WEAPONS);
                        alivePlayers.forEach(player => {
                            const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                            weaponAssignments.push(selectedWeapon.discovery(player));
                            player.takeDamage(selectedWeapon.damage(game.round, false));
                            player.equipWeapon(selectedWeapon);
                            if (!player.alive) casualties.push(`âœï¸ <@${player.id}>`);
                        });

                        const dayEmbed = new EmbedBuilder()
                            .setTitle(`Day ${game.round}`)
                            .setDescription(`**Single Player Fights**\n\n` + weaponAssignments.join('\n') + '\n\n' + casualties.join('\n'))
                            .setColor(0x953d59);

                        const dayMessage = await interaction.followUp({
                            embeds: [dayEmbed],
                            components: [main],
                            fetchReply: true
                        });
                        
                        const timeout = setTimeout(() => 
                            reject(new Error('Day phase timed out.')), GAME_EVENTS.day.duration);
                        game.registerCleanup(() => clearTimeout(timeout));

                        const collector = dayMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: GAME_EVENTS.day.duration
                        }).on('collect', async i => {
                            if (i.customId === 'next') {
                                await i.deferUpdate();
                                collector.stop();

                                dayMessage.edit({
                                    embeds: [dayEmbed],
                                    components: [done]
                                });

                                await game.transitionTo('night', interaction);
                                resolve();
                            }
                        });





                    }

                    else{
                        // 2 player fights

                        fightLog = [];
                        casualties = [];

                        for(const attacker of alivePlayers){
                            if(!attacker.alive) continue;

                            let defender;
                            const potentialDefenders = alivePlayers.filter(p => p.id !== attacker.id && p.alive);
                            if(potentialDefenders.length === 0) continue;
                            defender = potentialDefenders[Math.floor(Math.random() * potentialDefenders.length)];

                            const weapon = Array.from(attacker.weapons)[Math.floor(Math.random() * attacker.weapons.size)];
                            fightLog.push(weapon.attack(attacker, defender, game.round));

                            if(!defender.alive) casualties.push(`âœï¸ <@${defender.id}>`);
                        }

                        const dayEmbed = new EmbedBuilder()
                            .setTitle(`Day ${game.round}`)
                            .setDescription(`**2 Player Fights**\n\n` + fightLog.join('\n') + '\n\n' + casualties.join('\n'))
                            .setColor(0x953d59);

                        const dayMessage = await interaction.followUp({
                            embeds: [dayEmbed],
                            components: [main],
                            fetchReply: true
                        });
                        
                        const timeout = setTimeout(() => 
                            reject(new Error('Day phase timed out.')), GAME_EVENTS.day.duration);
                        game.registerCleanup(() => clearTimeout(timeout));

                        const collector = dayMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: GAME_EVENTS.day.duration
                        }).on('collect', async i => {
                            if (i.customId === 'next') {
                                await i.deferUpdate();
                                collector.stop();

                                dayMessage.edit({
                                    embeds: [dayEmbed],
                                    components: [done]
                                });



                                await game.transitionTo('night', interaction);
                                resolve();
                            }
                        });

                        game.collectors.push(collector);
                        game.registerCleanup(() => collector.stop());

                    } 


                } catch (error) {
                    game.cleanup();
                    reject(error);
                }
            });
        },
        transitions: {
            next: 'night'
        }
    },

    night: {
        duration: 60000,
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                    
                    let nightFight = [];
                    casualties = [];

                    for(const player of alivePlayers){
                        const weaponKeys = Object.keys(WEAPONS);
                        const selectedWeapon = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
                        const weapon = WEAPONS[selectedWeapon];

                        nightFight.push(weapon.discovery(player));
                        player.takeDamage(weapon.damage(game.round, false));
                        player.equipWeapon(weapon);
                        if (!player.alive) casualties.push(`âœï¸ <@${player.id}>`);
                    }

                    const nightEmbed = new EmbedBuilder()
                        .setTitle(`Night ${game.round}`)
                        .setDescription(`**Night Fights**\n\n` + nightFight.join('\n') + '\n\n' + casualties.join('\n'))
                        .setColor(0x953d59);

                    const nightMessage = await interaction.followUp({
                        embeds: [nightEmbed],
                        components: [main],
                        fetchReply: true
                    });
                    
                    const timeout = setTimeout(() => 
                        reject(new Error('Night phase timed out.')), GAME_EVENTS.night.duration);
                    game.registerCleanup(() => clearTimeout(timeout));

                    const collector = nightMessage.createMessageComponentCollector({
                        filter: i => i.user.id === game.hoster,
                        time: GAME_EVENTS.night.duration
                    }).on('collect', async i => {
                        if (i.customId === 'next') {
                            await i.deferUpdate();
                            collector.stop();

                            nightMessage.edit({
                                embeds: [nightEmbed],
                                components: [done]
                            });

                            await game.transitionTo('day', interaction);
                            resolve();
                        }
                    });

                    game.collectors.push(collector);
                } catch (error) {
                    game.cleanup();
                    reject(error);
                }
            });
        },
        transitions: {
            next: 'day'
        }
    },

    winner: {
        duration: 30000,
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const winner = game.checkWinner();
                    if (!winner) {
                        await interaction.followUp('No winner found, game ended with multiple survivors.');
                        resolve();
                        return;
                    }

                    const winnerEmbed = new EmbedBuilder()
                        .setTitle(`ðŸ† Winner: <@${winner.id}> ðŸ†`)
                        .setDescription(`Congratulations <@${winner.id}>! You have won the Hunger Games!`)
                        .setColor(0x953d59)
                        .setThumbnail(winner.avatar);

                    await interaction.followUp({ embeds: [winnerEmbed] });

                    setTimeout(() => {
                        // Cleanup after winner announcement
                        game.cleanup(); 
                        workingHG = false; // Reset the game state
                    }, GAME_EVENTS.winner.duration);
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        transitions: {}
        
    }
                
                    
    
};


    
export default {
    data: new SlashCommandBuilder()
        .setName('hg')
        .setDescription('Hunger Games!'),
    async execute(interaction){
        await interaction.deferReply();
        const member = interaction.member;
        if(member.roles.cache.has(allowedRoles[0])){
            if (workingHG) {
                return interaction.followUp('A game is already in progress!');
            } else{
                workingHG = true;
                const game = new GameState(interaction.user.id);

                try{// lobby phase
                    await game.transitionTo('lobby', interaction);

                } catch (error){
                    workingHG = false;
                    console.error('Error during lobby phase:', error);
                    //return interaction.followUp('An error occurred while starting the game.');
                }
            }
        } else{
            return interaction.followUp('no');

        };
    }    
};    