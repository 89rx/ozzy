import { EmbedBuilder } from 'discord.js';
import { WEAPONS } from './weapons.js';
import { main, done } from './hungerGames.js';

export const EMOJIS = {
    
    JOIN: '🏹',
    START: '⚔️',
    OZZY: '🗡'
    
};

export class Player {
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

export class GameState {
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

export const GAME_EVENTS = {

    
    lobby: {
        duration: 300000, // 5 minutes
        execute: async (game, interaction) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const startEmbed = new EmbedBuilder()
                    .setTitle("🏹 Hunger Games 🏹")
                    .setDescription(
                        `The Reaping\nHosted by: <@${game.hoster}>\n\n` +
                        `React with ${EMOJIS.JOIN} to **Participate**\n\n` +
                        `React with ${EMOJIS.OZZY} to **Add Ozzy**\n\n` +
                        `React with ${EMOJIS.START} to **Begin**`
                    )
                    .setColor(0x953d59);

                    game.messages.lobby = await interaction.followUp({embeds: [startEmbed]}, { fetchReply: true });
                        
                    await Promise.all([
                        game.messages.lobby.react(EMOJIS.JOIN),
                        game.messages.lobby.react(EMOJIS.OZZY),
                        game.messages.lobby.react(EMOJIS.START)
                    ]);
        
                    // 4. Setup timeout rejection
                    const timeout = setTimeout(() => {
                        reject(new Error('Lobby timed out'));
                    }, this.duration);
                    game.registerCleanup(() => clearTimeout(timeout));
                

                    
                    game.collectors = [
                        // Join collector
                        game.messages.lobby.createReactionCollector({
                            filter: (r, u) => r.emoji.name === EMOJIS.JOIN && !u.bot,
                            time: this.duration
                        }).on('collect', (r, u) => {
                            if (!game.players.has(u.id)) {
                                game.players.set(u.id, new Player(u.id, u.displayAvatarURL()));
                                this.updateLobbyMessage(game);
                            }
                        }),

                        // Ozzy collector
                        game.messages.lobby.createReactionCollector({
                            filter: (r, u) => r.emoji.name === EMOJIS.OZZY && !u.bot,
                            time: this.duration
                        }).on('collect', (r, u) => {
                            if (u.id === game.hoster && !game.players.has(OZZY_ID)) {
                                game.players.set(OZZY_ID, new Player(
                                    OZZY_ID, 
                                    "https://i.imgur.com/HOVguxl.jpeg"
                                ));
                                this.updateLobbyMessage(game);
                            }
                        }),

                        game.messages.lobby.createReactionCollector({
                            filter: (r, u) => r.emoji.name === EMOJIS.START && u.id === game.hoster,
                            time: this.duration
                        }).on('collect', async () => {
                            try{
                                if (game.players.size >= 2) {
                                    // Freeze the lobby message (disable components)
                                    await game.messages.lobby.edit({
                                        components: [done] // Uses the disabled button state
                                    });

                                    // Create a NEW message for the game start
                                    const startAnnounce = new EmbedBuilder()
                                        .setTitle("⚔️ Hunger Games Begin ⚔️")
                                        .setDescription("Tributes enter the arena...")
                                        .setColor(0x953d59);
                                    
                                    await interaction.followUp({ embeds: [startAnnounce] });
                                    
                                    // Proceed to cornucopia with new message reference
                                    await interaction.followUp({ 
                                        content: "Loading cornucopia..."
                                    });
                                    await game.transitionTo(this.transitions.start, interaction);

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


        updateLobbyMessage: (game) => {
            const playerList = Array.from(game.players.values())
                .map(p => `<@${p.id}>`)
                .join('\n');
            
            const embed = new EmbedBuilder()
                .setTitle(`Lobby (${game.players.size}/24)`)
                .setDescription(
                    `Host: <@${game.hoster}>\n\n` +
                    `**Players**:\n${playerList || "None"}\n\n` +
                    `${EMOJIS.JOIN} Join | ${EMOJIS.START} Begin`
                )
                .setColor(0x953d59);

            game.messages.lobby.edit({
                embeds: [embed],
                components: [game.players.size >= 2 ? main : done]
            });
        },
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
                        if (!player.alive) casualties.push(`✝️ <@${player.id}>`);
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
                        reject(new Error('Timeout')), this.duration);
                    game.registerCleanup(() => clearTimeout(timeout));
    
                    // Next button
                    const collector = game.messages.current.createMessageComponentCollector({
                        filter: i => i.user.id === game.hoster,
                        time: this.duration
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
                                    fightLog.push(`\n🏆 <@${currentAttacker.id}> wins the Hunger Games!`);
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
                            if (!player.alive) casualties.push(`✝️ <@${player.id}>`);
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
                            reject(new Error('Day phase timed out.')), this.duration);
                        game.registerCleanup(() => clearTimeout(timeout));

                        const collector = dayMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: this.duration
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

                            if(!defender.alive) casualties.push(`✝️ <@${defender.id}>`);
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
                            reject(new Error('Day phase timed out.')), this.duration);
                        game.registerCleanup(() => clearTimeout(timeout));

                        const collector = dayMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: this.duration
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
                        if (!player.alive) casualties.push(`✝️ <@${player.id}>`);
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
                        reject(new Error('Night phase timed out.')), this.duration);
                    game.registerCleanup(() => clearTimeout(timeout));

                    const collector = nightMessage.createMessageComponentCollector({
                        filter: i => i.user.id === game.hoster,
                        time: this.duration
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
                        .setTitle(`🏆 Winner: <@${winner.id}> 🏆`)
                        .setDescription(`Congratulations <@${winner.id}>! You have won the Hunger Games!`)
                        .setColor(0x953d59)
                        .setThumbnail(winner.avatar);

                    await interaction.followUp({ embeds: [winnerEmbed] });

                    setTimeout(() => {
                        // Cleanup after winner announcement
                        game.cleanup(); 
                        workingHG = false; // Reset the game state
                    }, this.duration);
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        transitions: {}
        
    }
                
                    
    
};