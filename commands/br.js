import { SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

class Player {
    constructor(id, avatarURL) {
        this.id = id;
        this.avatar = avatarURL;
        this.health = 100;
        this.alive = true;
        this.weapons = [];
        this.currentZone = null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) this.alive = false;
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount );
    }

    equipWeapon(weapon) {
        this.weapons.add(weapon);
    }
};

const ZONES = {

    iceberg: {
        name: 'iceberg',

        loot: {

            snowball: {
                discovery: function(player){
                    return `<@${player.id}> found a snowball.`;

                },

                attack: function(player, defender, round){
                    const damage = 3 * round;
                    defender.takeDamage(damage);

                    return `<@${player.id}> hit <@${defender.id}> with a snowball!`;

                }
            },

            fishing_rod: {
                discovery: (player) => `<@${player.id}> snatched a fishing rod from Herbert's stash! 🎣`,
                attack: (player, defender, round) => {
                    const damage = 5 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> hooks <@${defender.id}> for ${damage} damage!`;
                }
            }    


        }
    },

    cove: {
        name: 'cove',
        loot: {
            // COMMON: "Soggy Cannonball" (From Shipwrecks)
            cannonball: {
                discovery: (player) => `<@${player.id}> dug up a waterlogged cannonball! 💦`,
                attack: (player, defender, round) => {
                    const damage = 4 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> launches a cannonball at <@${defender.id}>! Sploosh!`;
                }
            },
            // RARE: "Captain's Cutlass" (From Cap'n Smol)
            cutlass: {
                discovery: (player) => `<@${player.id}> stole Cap'n Smol's prized cutlass! ⚔️`,
                attack: (player, defender, round) => {
                    const damage = 7 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> slashes <@${defender.id}> with the cutlass! ("Yarr!")`;
                }
            }
        }
    },

    mines: {
        name: 'mines',

        loot: {
            // COMMON: "Pickaxe" (Mining tool)
            pickaxe: {
                discovery: (player) => `<@${player.id}> found a rusty pickaxe! ⛏️`,
                attack: (player, defender, round) => {
                    const damage = 3 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> cracks <@${defender.id}> with a pickaxe!`;
                }
            },
            // RARE: "Golden Nugget" (Ultra-rare rock)
            golden_nugget: {
                discovery: (player) => `<@${player.id}> struck gold! 💛`,
                attack: (player, defender, round) => {
                    const damage = 8 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> bonks <@${defender.id}> with a golden nugget! *Cha-ching!*`;
                }
            }
        }
    },

    forest: {
        name: 'forest',
        loot: {
            // COMMON: "Puffle Berry" (From bushes)
            puffle_berry: {
                discovery: (player) => `<@${player.id}> found a toxic puffle berry! 🍇`,
                attack: (player, defender, round) => {
                    const damage = 2 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> flings a berry at <@${defender.id}>. They look queasy!`;
                }
            },
            // RARE: "Puffle Whistle" (Summon wild puffles)
            puffle_whistle: {
                discovery: (player) => `<@${player.id}> found the legendary Puffle Whistle! 📯`,
                attack: (player, defender, round) => {
                    const damage = 6 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> blows the whistle—a wild puffle attacks <@${defender.id}>!`;
                }
            }
        }
    },

    stadium: {
        name: 'stadium',
        loot: {
            // COMMON: "Hockey Stick" (From hockey minigame)
            hockey_stick: {
                discovery: (player) => `<@${player.id}> grabbed a hockey stick! 🏒`,
                attack: (player, defender, round) => {
                    const damage = 4 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> slaps <@${defender.id}> with the stick! *Clack!*`;
                }
            },
            // RARE: "Soccer Ball Bomb" (From PSA missions)
            soccer_bomb: {
                discovery: (player) => `<@${player.id}> found a suspicious soccer ball... 💣`,
                attack: (player, defender, round) => {
                    const damage = 9 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> kicks the ball at <@${defender.id}>—it explodes! 💥`;
                }
            }
        }
    },

    plaza: {
        name: 'plaza',
        loot: {
            // COMMON: "Pizza Box" (From Pizza Parlor)
            pizza_box: {
                discovery: (player) => `<@${player.id}> found a stale pizza box! 🍕`,
                attack: (player, defender, round) => {
                    const damage = 3 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> smacks <@${defender.id}> with the box. *"Ew, anchovies!"*`;
                }
            },
            // RARE: "Dance Floor Bomb" (From Dance Contest)
            dance_bomb: {
                discovery: (player) => `<@${player.id}> found a disco ball bomb! 💃`,
                attack: (player, defender, round) => {
                    const damage = 7 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> throws the bomb—<@${defender.id}> gets blasted by glitter! ✨`;
                }
            }
        }
    },

    town: {
        name: 'town',
        loot: {
            // COMMON: "Newspaper Roll" (From the CP Times)
            newspaper: {
                discovery: (player) => `<@${player.id}> grabbed a rolled-up newspaper! 📰`,
                attack: (player, defender, round) => {
                    const damage = 3 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> whacks <@${defender.id}> with the newspaper! *"Extra! Extra!"*`;
                }
            },
            // RARE: "Gavel of Justice" (From the PSA HQ)
            gavel: {
                discovery: (player) => `<@${player.id}> found the PSA's golden gavel! ⚖️`,
                attack: (player, defender, round) => {
                    const damage = 8 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> slams the gavel—<@${defender.id}> is sentenced to damage!`;
                }
            }
        }
    },

    docks: {
        name: 'docks',
        loot: {
            // COMMON: "Rusty Anchor" (From the shipwreck)
            anchor: {
                discovery: (player) => `<@${player.id}> dragged up a tiny anchor! ⚓`,
                attack: (player, defender, round) => {
                    const damage = 4 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> crushes <@${defender.id}> with the anchor! *"Heavy!"*`;
                }
            },
            // RARE: "Treasure Map Trap" (From Herbert's stash)
            treasure_map: {
                discovery: (player) => `<@${player.id}> unrolled a map... it's a trap! 🗺️💥`,
                attack: (player, defender, round) => {
                    const damage = 7 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> lures <@${defender.id}> into a trap—BOOM!`;
                }
            }
        }
    },

    beach: {
        name: 'beach',
        loot: {
            // COMMON: "Sandy Shovel" (From building sandcastles)
            shovel: {
                discovery: (player) => `<@${player.id}> picked up a sandy shovel! 🏝️`,
                attack: (player, defender, round) => {
                    const damage = 3 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> bonks <@${defender.id}> with the shovel. Sand flies everywhere!`;
                }
            },
            // RARE: "Crab Cannon" (From the Jet Pack Adventure)
            crab_cannon: {
                discovery: (player) => `<@${player.id}> found a crab-powered cannon! 🦀🔫`,
                attack: (player, defender, round) => {
                    const damage = 6 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> fires a crab at <@${defender.id}>! *Pinch!*`;
                }
            }
        }
    },

    snowforts: {
        name: 'snowforts',
        loot: {
            // COMMON: "Ice Block" (From fort walls)
            ice_block: {
                discovery: (player) => `<@${player.id}> pried loose a frozen ice block! 🧊`,
                attack: (player, defender, round) => {
                    const damage = 4 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> drops the block on <@${defender.id}>! *CRUNCH*`;
                }
            },
            // RARE: "Snow Cannon" (From the Snowball Battle minigame)
            snow_cannon: {
                discovery: (player) => `<@${player.id}> commandeered a snow cannon! ❄️💣`,
                attack: (player, defender, round) => {
                    const damage = 9 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> blasts <@${defender.id}> with a mega snowball!`;
                }
            }
        }
    },

    skihill: {
        name: 'skihill',
        loot: {
            // COMMON: "Ski Pole" (From the slopes)
            ski_pole: {
                discovery: (player) => `<@${player.id}> snapped a ski pole in half! 🎿`,
                attack: (player, defender, round) => {
                    const damage = 3 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> jabs <@${defender.id}> with the pole! *"No skiing for you!"*`;
                }
            },
            // RARE: "Yeti Sled" (From the Mountain Expedition)
            yeti_sled: {
                discovery: (player) => `<@${player.id}> found the Yeti's stolen sled! 🛷`,
                attack: (player, defender, round) => {
                    const damage = 10 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> runs over <@${defender.id}> with the sled! *"WHEEE—CRASH!"*`;
                }
            }
        }
    },

    dojo: {
        name: 'dojo',
        loot: {
            // COMMON: "Bamboo Staff" (From training dummies)
            bamboo_staff: {
                discovery: (player) => `<@${player.id}> grabbed a bamboo staff! 🎋`,
                attack: (player, defender, round) => {
                    const damage = 5 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> strikes <@${defender.id}> with the staff! *"Hi-yah!"*`;
                }
            },
            // RARE: "Dragon Scroll" (From Sensei’s secret stash)
            dragon_scroll: {
                discovery: (player) => `<@${player.id}> unrolled the forbidden Dragon Scroll! 🐉📜`,
                attack: (player, defender, round) => {
                    const damage = 12 * round;
                    defender.takeDamage(damage);
                    return `<@${player.id}> unleashes the scroll's power—<@${defender.id}> is engulfed in flames! 🔥`;
                }
            }
        }
    }




}

class BattleRoyale {
    constructor(hoster){
        this.squads = new Map();
        this.safeZones = ['plaza', 'forest', 'stadium', 'cove', 'town', 'snowforts', 'skihill', 'dojo']; //'town', 'snowforts', 'skihill', 'dojo', 'beach', 'docks', 'mines', 'iceberg
        this.dangerZones = [];
        this.collectors = [];
        this.ring = 0;
        this.players = new Map();
        this.phase = 'lobby';
        this.hoster = hoster;
        this.finalShowdown = null;
    }

    advanceRing() {
        // Ensure we don't try to infect more zones than exist
        const zonesToInfect = Math.min(
            Math.random() < 0.2 ? 2 : 3,
            this.safeZones.length
        );
        
        // No zones left to infect (end game)
        if (zonesToInfect === 0) {
            console.log("No safe zones left to infect - final zone reached!");
            return;
        }
    
        const shuffledSafeZones = shuffleArray([...this.safeZones]);
        const infected = shuffledSafeZones.splice(0, zonesToInfect);
    
        this.safeZones = this.safeZones.filter(zone => !infected.includes(zone));
        this.dangerZones.push(...infected);
    
        console.log(`Ring advanced! ${infected.join(', ')} became danger zones.`);
        console.log(`Remaining safe zones: ${this.safeZones.join(', ')}`);
    }

    allocateSquads() {
        // Final showdown case - all squads to one danger zone
        if (this.safeZones.length <= 1) {  // Changed to <= 1 for single safe zone
            // Only set finalShowdown if it hasn't been set yet
            if (!this.finalShowdown) {
                this.finalShowdown = this.safeZones.length === 1 
                    ? this.safeZones[0]  // Use last safe zone
                    : this.dangerZones[Math.floor(Math.random() * this.dangerZones.length)];
                
                console.log(`🚨 FINAL SHOWDOWN ZONE SET: ${this.finalShowdown.toUpperCase()}!`);
            }
    
            // Move all squads to the final showdown zone
            this.squads.forEach((squad, squadId) => {
                squad.players.forEach(player => {
                    player.currentZone = this.finalShowdown;
                });
                console.log(`Squad ${squadId} moved to final showdown at ${this.finalShowdown}`);
            });
            return;
        }
    
        // Normal allocation (80/20 split)
        this.squads.forEach((squad, squadId) => {
            const isDangerSquad = Math.random() < 0.2; // 20% chance
            
            const targetZone = isDangerSquad && this.dangerZones.length > 0
                ? this.dangerZones[Math.floor(Math.random() * this.dangerZones.length)]
                : this.safeZones[Math.floor(Math.random() * this.safeZones.length)];
    
            squad.players.forEach(player => {
                player.currentZone = targetZone;
            });
            
            console.log(`Squad ${squadId} sent to ${targetZone}`, 
                isDangerSquad ? "(risky)" : "(safe)");
        });
    }

    async updateLobbyMessage(message) {
        // Create squad fields
        const squadFields = [...this.squads.values()].map((squad, index) => {
            const squadMembers = squad.players.map(player => 
                `• <@${player.id}> ${player.id === this.hoster ? '(Host)' : ''}`
            ).join('\n');
    
            return {
                name: `Squad ${index + 1} (${squad.players.length} member${squad.players.length !== 1 ? 's' : ''})`,
                value: squadMembers || 'No members yet',
                inline: true
            };
        });
    
        // Create the embed
        const lobbyEmbed = new EmbedBuilder()
            .setTitle('**Battle Royale Lobby**')
            .setColor('#00FF00')
            .setDescription(`Waiting for players... (${this.players.size}/16`)
            .addFields(squadFields)
            .setFooter({
                text: `React with 🎮 to join | Host: <@${this.hoster}>`,
            });
    
        // Edit the original message
        try {
            await message.edit({
                embeds: [lobbyEmbed],
            });
        } catch (error) {
            console.error('Failed to update lobby message:', error);
        }
    }

    cleanupCollectors () {
        this.collectors.forEach(async (collector) => {
            if(!collector.ended){
                await collector.stop(); // triggers it's end ev.
            }
        });

        this.collectors = [];
    }

    async transitionTo (phaseName, interaction) {
        this.cleanupCollectors();
        //this.phase = phaseName;

        try{
            await GAME_EVENTS[phaseName].execute(this, interaction);
        } catch(error) {
            console.error("Error during transitioning.", error);
            workingHG = false;
            this.cleanupCollectors();
            interaction.channel.send({embeds: [crashEmbed]});
        }

    }

    discoveryPhase() {

        const weaponAssignments = [];
        // First filter alive players
        const alivePlayers = Array.from(this.players.values()).filter(player => player.alive);
        
        // Then process only alive players
        alivePlayers.forEach(player => {
          const zone = ZONES[player.currentZone];
          const lootKeys = Object.keys(zone.loot);
          const randomWeaponKey = lootKeys[Math.floor(Math.random() * lootKeys.length)];
          const weapon = zone.loot[randomWeaponKey];
      
          // Push the complete weapon object with all methods
          player.weapons.push({
            ...weapon,
            id: randomWeaponKey  // Optional: add weapon ID for reference
          });
      
        });
      }

    deathMessage(casualties) {

        const description = casualties.length > 0
        ? `☠️ The fallen:\n${casualties.map(id => `• <@${id}>`).join('\n')}`
        : '✨ No tributes died today.'; // Fallback for empty array

        const deathEmbed = new EmbedBuilder()
            .setTitle("💥 **Cannons** 💥")
            .setDescription(description)
            .setColor(0xFFA500);

        return deathEmbed;
    }

    statMessage() {
        // Create squad fields
        const squadFields = [...this.squads.values()].map(squad => {
          const alivePlayers = squad.players.filter(player => player.alive);
          
          return {
            name: `${squad.name} (${alivePlayers.length} alive)`,
            value: alivePlayers.map(player => 
              `• <@${player.id}>: ${player.health} HP ${player.weapons.length > 0 ? '| ' + player.weapons.map(w => w.id).join(', ') : ''}`
            ).join('\n') || 'No living members',
            inline: false
          };
        });
      
        // Create the embed
        const statsEmbed = new EmbedBuilder()
          .setTitle('**Battle Royale Stats**')
          .setColor('#ff0000') // Red color for stats
          .addFields(squadFields)
          .setFooter({
            text: `Safe Zones: ${this.safeZones.join(', ')} | Total Alive: ${this.getAliveCount()}`,
          })
          .setTimestamp();
      
        return statsEmbed;
      }
      
      // Helper function to count alive players
      getAliveCount() {
        return [...this.players.values()].filter(player => player.alive).length;
    }

    async battlePhase() {
        console.log('[BATTLE PHASE STARTED] Round:', this.ring);
        const battleLog = [];
        const zoneBattles = {};
        const casualties = [];
    
        // 1. Group squads by zone
        const squadsByZone = new Map();
        console.log('Grouping squads by zone...');
        
        this.squads.forEach(squad => {
            const alivePlayers = squad.players.filter(p => p.alive);
            console.log(`- Squad ${squad.id} has ${alivePlayers.length} alive players`);
            
            if (alivePlayers.length > 0) {
                const zone = alivePlayers[0].currentZone;
                console.log(`  - Located in zone: ${zone}`);
                
                if (!squadsByZone.has(zone)) {
                    squadsByZone.set(zone, []);
                    console.log(`  - New zone registry created for ${zone}`);
                }
                squadsByZone.get(zone).push({
                    id: squad.id,
                    name: squad.name,
                    players: alivePlayers
                });
            }
        });
    
        // Log zone distribution
        console.log('\nZone Distribution:');
        squadsByZone.forEach((squads, zone) => {
            console.log(`- ${zone}: ${squads.length} squad(s)`);
            squads.forEach(squad => {
                console.log(`  - ${squad.name} (${squad.players.length} players)`);
            });
        });
    
        // 2. Check for battles
        let battlesOccurred = false;
        console.log('\nChecking for battles...');
        
        squadsByZone.forEach((squads, zone) => {
            if (squads.length >= 2) {
                battlesOccurred = true;
                console.log(`! BATTLE DETECTED in ${zone} (${squads.length} squads)`);
                
                const zoneLog = [];
                zoneBattles[zone] = zoneLog;
                zoneLog.push(`**${zone.toUpperCase()} BATTLE**`);
    
                // Handle odd number of squads
                const shuffledSquads = [...squads].sort(() => Math.random() - 0.5);

                // 2. Handle odd squad count (now random)
                if (shuffledSquads.length % 2 !== 0) {
                    const hidingSquad = shuffledSquads.pop(); // Removes a RANDOM squad (due to shuffle)
                    zoneLog.push(`• ${hidingSquad.name} hid and avoided combat!`);
                    console.log(`  - ${hidingSquad.name} randomly hid (odd squad count)`);
                }
    
                // Pair up squads
                while (shuffledSquads.length > 0) {
                    const squad1 = shuffledSquads.shift();
                    const squad2 = shuffledSquads.shift();
                    console.log(`  - MATCHUP: ${squad1.name} vs ${squad2.name}`);

                    const shuffledFighters1 = [...squad1.players].sort(() => 0.5 - Math.random());
                    const shuffledFighters2 = [...squad2.players].sort(() => 0.5 - Math.random());
                    console.log(`    - ${squad1.name} combatants: ${shuffledFighters1.length}`);
                    console.log(`    - ${squad2.name} combatants: ${shuffledFighters2.length}`);
    
                    // 1v1 battles
                    const numBattles = Math.min(shuffledFighters1.length, shuffledFighters2.length);
                    console.log(`    - Executing ${numBattles} 1v1 battles`);
                    
                    for (let i = 0; i < numBattles; i++) {
                        const attacker = shuffledFighters1[i];
                        const defender = shuffledFighters2[i];
                        console.log(`    - BATTLE ${i+1}: ${attacker.id} vs ${defender.id}`);
    
                        if (attacker.weapons.length > 0) {
                            const weapon1 = attacker.weapons[Math.floor(Math.random() * attacker.weapons.length)];
                            const weapon2 = defender.weapons[Math.floor(Math.random() * attacker.weapons.length)];

                            console.log(`      - ${attacker.id} using ${weapon1.id}`);
                            
                            const attackResult1 = weapon1.attack(attacker, defender, this.ring);
                            const attackResult2 = weapon2.attack(defender, attacker, this.ring);
                            zoneLog.push(`⚔️ ${attackResult1}`);
                            zoneLog.push(`⚔️ ${attackResult2}`);
                            console.log(`      - ATTACK RESULT: ${attackResult1}`);
    
                            if (defender.health <= 0) {
                                defender.alive = false;
                                casualties.push(`☠️ <@${defender.id}> was eliminated!`);
                                console.log(`      - ELIMINATION: ${defender.id}`);
                            }

                            if (attacker.health <= 0) {
                                attacker.alive = false;
                                casualties.push(`☠️ <@${attacker.id}> was eliminated!`);
                                console.log(`      - ELIMINATION: ${attacker.id}`);
                            }


                        } else {
                            zoneLog.push(`🫥 <@${attacker.id}> had no weapons to attack!`);
                            console.log(`      - NO WEAPONS: ${attacker.id} couldn't attack`);
                        }
                    }
                }
            }
        });
    
        if (!battlesOccurred) {
            console.log('No battles occurred this round');
            return {
                battleLog: ["No battles occurred - squads avoided each other"],
                battleEmbed: new EmbedBuilder()
                    .setTitle("**🌿 Peaceful Round**")
                    .setDescription(squadsByZone.size > 1 
                        ? "Squads stayed in separate zones" 
                        : "All squads avoided conflict")
                    .addFields({
                        name: "Safe Zones",
                        value: this.safeZones.join(", ")
                    }),
                casualties: []
            };
        }
    
        // 3. Create battle embed
        console.log('\nCreating battle embed...');
        const battleEmbed = new EmbedBuilder()
        .setTitle(`**Ring ${this.ring} Battle Results**`)
        .setColor('#FF0000');

    // Add validated fields
    Object.entries(zoneBattles).forEach(([zone, log]) => {
        const content = log.join('\n');
        if (content && content.trim().length > 0) {  // Ensure non-empty content
            battleEmbed.addFields({
                name: zone.toUpperCase(),
                value: content,
                inline: false
            });
        }
    });

    // Ensure at least one field exists
    if (battleEmbed.data.fields?.length === 0) {
        battleEmbed.setDescription("No combat occurred between squads");
    }

    
    
        // 4. Clean up dead players
        console.log('\nCleaning up eliminated players...');
        this.squads.forEach(squad => {
            const before = squad.players.length;
            squad.players = squad.players.filter(p => p.alive);
            console.log(`- Squad ${squad.id}: ${before} → ${squad.players.length} players`);
        });
    
        console.log('[BATTLE PHASE COMPLETE]');
        return {
            battleLog,
            battleEmbed,  // Now guaranteed valid
            casualties
        };
    }

    checkWinner(interaction) {
        // First compute alive squads efficiently
        const aliveSquads = [...this.squads.values()].filter(squad => 
            squad.players.some(p => p.alive)
        );
        
        // Squad victory (even if only 1 player remains)
        if (aliveSquads.length === 1) {
            const winningSquad = aliveSquads[0];
            const aliveCount = winningSquad.players.filter(p => p.alive).length;
            
            const winnerEmbed = new EmbedBuilder()
                .setTitle("**Battle Royale Champion!**")
                .setDescription(`🏆 ${winningSquad.name} wins with ${aliveCount} survivor${aliveCount > 1 ? 's' : ''}!`)
                .setColor(0x953d59)
                .setThumbnail(winningSquad.players.find(p => p.alive)?.avatar || ozzyAvatarURL);
            
            interaction.channel.send({ embeds: [winnerEmbed] });
            console.log("Hunger Games BR ended - Squad victory");
            workingHG = false;
            this.cleanupCollectors();
            return winningSquad;
        }
        // Total elimination
        else if (aliveSquads.length === 0) {
            const ozzyEmbed = new EmbedBuilder()
                .setTitle("**Battle Royale Ended**")
                .setDescription("💀 All squads eliminated! Ozzy wins by default.")
                .setColor(0x953d59)
                .setThumbnail(ozzyAvatarURL);
            
            interaction.channel.send({ embeds: [ozzyEmbed] });
            console.log("Hunger Games BR ended - Ozzy victory");
            workingHG = false;
            this.cleanupCollectors();
            return "ozzy";
        }
        
        return null; // No winner yet
    }

    
}

const GAME_EVENTS = {

    ring: {
        name: 'ring',
        execute: async(game, interaction) => {
            try {

                await game.advanceRing();
                await game.allocateSquads();

                game.ring++;

                await game.discoveryPhase();
                const casualties = [];


                const ringEmbed = new EmbedBuilder()
                    .setTitle(`**Ring ${game.ring}: Discovery Phase**`)
                    .setColor('#0099ff') // Optional: Set a color
                    .setFields(
                        // Create a field for each squad
                        ...[...game.squads.values()].map(squad => ({
                        name: `${squad.name} (${squad.players[0].currentZone})`, // All squad members are in same zone
                        value: squad.players
                            .filter(player => player.alive)
                            .map(player => {
                            const lastWeapon = player.weapons[player.weapons.length - 1]; // Get most recently found weapon
                            return lastWeapon 
                                ? lastWeapon.discovery(player) 
                                : `${player.id} found nothing!`;
                            })
                            .join('\n'),
                        inline: false // Set to true if you want side-by-side squad displays
                        }))
                    )
                    .setFooter({
                        text: `Safe Zones: ${game.safeZones.join(', ')}`,
                    });

                
                const message = await interaction.channel.send({
                    embeds: [ringEmbed],
                    components: [main],
                    fetchReply: true
                });

                const ringCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(ringCollector);

                ringCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[ringEmbed],
                            components:[done]
                        });

                        const deathEmbed = await game.deathMessage(casualties);

                        const deathMessage = await interaction.channel.send({
                            embeds: [deathEmbed],
                            components: [main],
                            fetchReply: true
                        });



                        const deathCollector = deathMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: 300000
                        });

                        await game.collectors.push(deathCollector);

                        deathCollector.on('end', async () => {

                            await deathMessage.edit({
                                embeds:[deathEmbed],
                                components:[done]
                            });
        
                            if(game.phase === 'deaths'){ // deaths timeout logic
                                await game.cleanupCollectors();
                                workingHG = false;
                                await interaction.channel.send({ embeds: [timeoutEmbed]});
                            }
                        });

                        deathCollector.on('collect', async i => {
                            if(i.customId === 'next'){

                                await i.deferUpdate();

                                game.phase = 'stats';
                                await deathMessage.edit({
                                    embeds: [deathEmbed],
                                    components: [done]
                                    
                                });

                                const statsEmbed = await game.statMessage();

                                const statsMessage = await interaction.channel.send({
                                    embeds: [statsEmbed],
                                    components: [main],
                                    fetchReply: true
                                });
        
        
        
                                const statsCollector = statsMessage.createMessageComponentCollector({
                                    filter: i => i.user.id === game.hoster,
                                    time: 300000
                                });
        
                                await game.collectors.push(statsCollector);

                                statsCollector.on('end', async () => {

                                    await statsMessage.edit({
                                        embeds:[statsEmbed],
                                        components:[done]
                                    });
                
                                    if(game.phase === 'stats'){ // stats timeout logic
                                        await game.cleanupCollectors();
                                        workingHG = false;
                                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                                    }
                                });

                                statsCollector.on('collect', async i => {
                                    if(i.customId === 'next'){

                                        await i.deferUpdate();
                                        console.log("STARTING DAY TRANSITION");
                                        game.phase = 'battle';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            await game.transitionTo('battle', interaction);
                                            console.log("After transitionTo");
                                        } catch(error){
                                            console.error("Error during transitioning.", error);
                                            workingHG = false;
                                            game.cleanupCollectors();
                                            interaction.channel.send({embeds: [crashEmbed]});
                                        }    
                                    }
                                })


                            }
                        })
                    }
                });

                ringCollector.on('end', async () => {

                    await message.edit({
                        embeds:[ringEmbed],
                        components:[done]
                    });

                    if(game.phase === 'ring'){ // ring timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });


                
            } catch (error) {

                console.error("Error during Ring", error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
                
            }
        }
    },

    battle: {
        name: 'battle',
        execute: async(game, interaction) => {
            try {

                if(game.finalShowdown) game.ring++;


                // Destructure the results:
                const { battleLog, battleEmbed, casualties } = await game.battlePhase();;

                // In your main function where you call battlePhase():

                
                    const message = await interaction.channel.send({
                        embeds: [battleEmbed],
                        components: [main],
                        fetchReply: true
                    });

                


                
                

                const ringCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(ringCollector);

                ringCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[battleEmbed],
                            components:[done]
                        });

                        const deathEmbed = await game.deathMessage(casualties);

                        const deathMessage = await interaction.channel.send({
                            embeds: [deathEmbed],
                            components: [main],
                            fetchReply: true
                        });



                        const deathCollector = deathMessage.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: 300000
                        });

                        await game.collectors.push(deathCollector);

                        deathCollector.on('end', async () => {

                            await deathMessage.edit({
                                embeds:[deathEmbed],
                                components:[done]
                            });
        
                            if(game.phase === 'deaths'){ // deaths timeout logic
                                await game.cleanupCollectors();
                                workingHG = false;
                                await interaction.channel.send({ embeds: [timeoutEmbed]});
                            }
                        });

                        deathCollector.on('collect', async i => {
                            if(i.customId === 'next'){

                                await i.deferUpdate();

                                game.phase = 'stats';
                                await deathMessage.edit({
                                    embeds: [deathEmbed],
                                    components: [done]
                                    
                                });

                                const statsEmbed = await game.statMessage();

                                const statsMessage = await interaction.channel.send({
                                    embeds: [statsEmbed],
                                    components: [main],
                                    fetchReply: true
                                });
        
        
        
                                const statsCollector = statsMessage.createMessageComponentCollector({
                                    filter: i => i.user.id === game.hoster,
                                    time: 300000
                                });
        
                                await game.collectors.push(statsCollector);

                                statsCollector.on('end', async () => {

                                    await statsMessage.edit({
                                        embeds:[statsEmbed],
                                        components:[done]
                                    });
                
                                    if(game.phase === 'stats'){ // stats timeout logic
                                        await game.cleanupCollectors();
                                        workingHG = false;
                                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                                    }
                                });

                                statsCollector.on('collect', async i => {
                                    if(i.customId === 'next'){

                                        await i.deferUpdate();
                                        console.log("STARTING DAY TRANSITION");
                                        game.phase = 'ring';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            if(!game.checkWinner(interaction)){
                                                if(!game.finalShowdown){

                                            await game.transitionTo('ring', interaction);
                                                } else{
                                                    await game.transitionTo('battle', interaction);

                                                }
                                            console.log("After transitionTo");
                                            }
                                        } catch(error){
                                            console.error("Error during transitioning.", error);
                                            workingHG = false;
                                            game.cleanupCollectors();
                                            interaction.channel.send({embeds: [crashEmbed]});
                                        }    
                                    }
                                })


                            }
                        })
                    }
                });

                ringCollector.on('end', async () => {

                    await message.edit({
                        embeds:[battleEmbed],
                        components:[done]
                    });

                    if(game.phase === 'battle'){ // ring timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });


                
            } catch (error) {

                console.error("Error during Ring", error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
                
            }
        }
    },


}

const joinEmoji = '🏹';
const startEmoji = '⚔️';
const addOzzyEmoji = '🗡';
const allowedRoles = ['1388586562245230752'];
let workingHG = false;
const OZZY_ID = '1253478821974245506';
let hoster = "";
const ozzyAvatarURL = "https://cdn.discordapp.com/attachments/1255311474872553554/1260572435938541668/ozzy.png?ex=668fcf11&is=668e7d91&hm=749ca7e11cb9c8007b4a44f3eb375aed6deb2ce59093eb4fabe5d5c2f828fbf9&";

const createButtons = () => ({
    next: new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary),
    nextDisabled: new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
});

const main = new ActionRowBuilder()
    .addComponents(createButtons().next);
const done = new ActionRowBuilder()
    .addComponents(createButtons().nextDisabled); 

const timeoutEmbed = new EmbedBuilder()
        .setTitle("** ⚠️ Timeout**")
        .setDescription("Hunger Games timed out due to inactivity!")
        .setColor(0xFF5733);

const crashEmbed = new EmbedBuilder()
        .setTitle("**Hunger Games Crashed**")
        .setDescription("Please report it to <@532991839238750243> or <@699314950270877758>.")
        .setColor(0xFF5733);      



export default  {

    data: new SlashCommandBuilder()
    .setName('hungerbr')
    .setDescription('brrboys'),

    async execute(interaction, client){
        await interaction.deferReply();

        const member = interaction.member;
        if(member.roles.cache.has(allowedRoles[0])){
            hoster = interaction.user.id;
            console.log('Hoster ID has been set:', hoster);
            if(!workingHG){
                try{

                    console.log(`test`);

                    const game = new BattleRoyale(hoster);

                    console.log(`test`);

                    let startEmbed = new EmbedBuilder()
                        .setTitle("Hunger Games")
                        .setDescription(`
                            **Hunger Games Battle Royale**
                            Hosted by: <@${game.hoster}>

                            React with ${joinEmoji} to **Participate**

                            React with ${addOzzyEmoji} to **Add Ozzy**

                            React with ${startEmoji} to **Begin**
                            `
                            
                        )
                        .setColor(0x953d59);

                    const message = await interaction.followUp({
                        embeds: [startEmbed],
                        fetchReply: true,
                    });
                    
                    workingHG = true;

                    message
                        .react(joinEmoji)
                        .then(() => message.react(addOzzyEmoji))
                        .then(() => message.react(startEmoji));

                    const joinFilter = (reaction, user) => {
                        return reaction.emoji.name === "🏹" && !user.bot; 
                    }
                    
                    const addOzzyFilter = (reaction, user) => {
                        return reaction.emoji.name === "🗡" && !user.bot;
                    }

                    const startFilter = (reaction, user) => {
                        return reaction.emoji.name === "⚔️" && !user.bot;
                    }

                    const joinCollector = message.createReactionCollector({
                        filter: joinFilter,
                        time: 300000
                    });

                    const ozzyCollector = message.createReactionCollector({
                        filter: addOzzyFilter,
                        time: 300000
                    });

                    const startCollector = message.createReactionCollector({
                        filter: startFilter,
                        time: 300000
                    });

                    game.collectors.push(...[joinCollector, ozzyCollector, startCollector]);

                    joinCollector.on('collect', (reaction, user) => {
                        console.log("We have started taking join reactions");
                        if (!game.players.has(user.id)) {
                            console.log(`Player <@${user.id}> is joining the game...`);
                            
                            // Create new player
                            const newPlayer = new Player(user.id, user.displayAvatarURL());
                            game.players.set(user.id, newPlayer);
                            
                            // Squad allocation logic
                            let addedToSquad = false;
                            
                            // Try to add to existing squad with only 1 member
                            for (const [squadId, squad] of game.squads) {
                                if (squad.players.length < 2) { // Max 2 players per squad
                                    squad.players.push(newPlayer);
                                    console.log(`Player <@${user.id}> added to squad ${squadId}`);
                                    addedToSquad = true;
                                    break;
                                }
                            }
                            
                            // If no available squads, create new squad
                            if (!addedToSquad) {
                                const squadId = `squad_${game.squads.size + 1}`;
                                game.squads.set(squadId, {
                                    name: `Squad ${game.squads.size + 1}`,
                                    players: [newPlayer]
                                });
                                console.log(`Created new squad ${squadId} for player <@${user.id}>`);
                            }
                            
                            game.updateLobbyMessage(message);
                        }
                    });
                    
                    ozzyCollector.on('collect', (reaction, user) => {
                        console.log(`We have started taking Ozzy reactions!`);
                        if (!game.players.has(OZZY_ID) && user.id === game.hoster) {
                            const ozzyPlayer = new Player(OZZY_ID, ozzyAvatarURL);
                            game.players.set(OZZY_ID, ozzyPlayer);
                            
                            // Add Ozzy to a squad (either existing or new)
                            let ozzyAdded = false;
                            for (const [squadId, squad] of game.squads) {
                                if (squad.players.length < 2) {
                                    squad.players.push(ozzyPlayer);
                                    ozzyAdded = true;
                                    break;
                                }
                            }
                            
                            if (!ozzyAdded) {
                                const squadId = `squad_${game.squads.size + 1}`;
                                game.squads.set(squadId, {
                                    name: `Squad ${game.squads.size + 1}`,
                                    players: [ozzyPlayer]
                                });
                            }
                            
                            console.log(`Ozzy has joined the game.`);
                            game.updateLobbyMessage(message);
                        }
                    });
                    
                    startCollector.on('collect', (reaction, user) => {
                        // Require at least 3 squads with at least 1 player each
                        const validSquads = [...game.squads.values()].filter(squad => squad.players.length > 0);
                        
                        if (validSquads.length >= 2) {
                            console.log(`We have ${validSquads.length} squads - ready to start`);
                            if (user.id === game.hoster) {
                                console.log(`Game starting...`);
                                game.phase = 'ring';
                                try {
                                    game.transitionTo('ring', interaction);
                                } catch (error) {
                                    console.error("Failed to transition", error);
                                    workingHG = false;
                                    this.cleanupCollectors();
                                    interaction.channel.send({embeds: [crashEmbed]});
                                }
                            }
                        } else {
                            console.log(`Not enough squads to start (${validSquads.length} of 3 required)`);
                        }
                    });
                    
                    // Keep your existing collector end handlers
                    startCollector.on("end", (collected, reason) => {
                        console.log(`stopped join collect`);
                        if (game.phase === 'lobby') {
                            game.cleanupCollectors();
                            workingHG = false;
                            interaction.channel.send({ embeds: [timeoutEmbed]});
                        }
                    });
                    
                    ozzyCollector.on("end", (collect, reason) => {
                        console.log(`stopped ozzy collect`);
                    });
                    
                    startCollector.on("end", (collect, reason) => {
                        console.log(`stopped start collect`);
                    });

                } catch (error) {
                    console.error("Error completing before reactions", error);
                    workingHG = false;
                }


            } else {
                interaction.followUp('Another game was going on!');
                console.log(`Another game was going on`);

            }

        } else {
            interaction.followUp('no');
            console.log(`Member did not have perms.`);
        }

        console.log(`This is the end of the code.`);
    }

}