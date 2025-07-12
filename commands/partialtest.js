import { SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';

const activeGames = new Map();

const CHARACTERS = {
    elp: function(player, rng) {
        const damage = rng ? 100 : 0;
        player.takeDamage(damage);

        return rng 
            ? `<@${player.id}> tells Elp that he's not the greatest. Elp publicly executes them.`
            : `<@${player.id}> exposed the underground staff food black market. Elp rewards <@${player.id}>!`; 

    },

    ayan: function(player, rng) {
        const damage = rng ? 100 : 0;
        player.takeDamage(damage);

        return rng 
            ? `<@${player.id}> claims that Summer Bash is not a real trophy. Ayan impales them with his pencil.`
            : `<@${player.id}> calls Ayan a curry muncher and receives Ayan Hats as a reward.`; 

    },

    scorp: function(player, rng) {
        const damage = rng ? 100 : 0;
        player.takeDamage(damage);

        return rng 
            ? `<@${player.id}> publicly states that rock music is the worst genre. Scorp smashes a fucking grand piano on their head.`
            : `<@${player.id}> listens to rock music for morale. Scorp notices and brews a coffee for them.`; 

    },




}

const WEAPONS = {
    coconut: {
        name: 'coconut',
        damage: function(round, rng) {
            const base = 3 * round;
            return rng ? base * 2 : base;
        },

        singleDay: function(player, round){
            const rng = Math.floor(Math.random() * 2);
            const damage = this.damage(round, rng);
            player.takeDamage(damage);

            return rng 
                ? `<@${player.id}> tried to cut a coconut tree but it fell on them.`
                : `A coconut fell on <@${player.id}>!`;

        },

        duelDay: function(attacker, target, round) {
            const damage = this.damage(round, 0);
            target.takeDamage(damage);

            return `<@${attacker.id}> throws a coconut at <@${target.id}> with incredible force!`;
        },

        discovery: (player) => `<@${player.id}> discovered Desireus' coconuts!`,

        night: function(player, round){
            const rng = Math.floor(Math.random() * 2);

            if(!rng) {
                return `<@${player.id}> slept peacefully through the night...`;
            } else{
                player.takeDamage(this.damage(round, 0));
                return `<@${player.id}> was sleeping and coconuts fell on them!`;
            }
            
        },

        feast: function(player, round){
            const healPoints = 7 * round;
            player.heal(healPoints);
            return `<@${player.id}> ate fortune coconuts. Health has increased.`;
            
        },

        finalDuel: function(attacker, target, round) {
            const damage = this.damage(round, 0);
            target.takeDamage(20 * damage);

            return `<@${attacker.id}> throws a coconut at <@${target.id}> with incredible force!`;
        }
    },

    axe: {
        name: 'axe',
        damage: function(round, rng) {
            const base = 3 * round;
            return rng ? base * 2 : base;
        },

        singleDay: function(player, round){
            const rng = Math.floor(Math.random() * 2);
            const damage = this.damage(round, rng);
            player.takeDamage(damage);

            return rng 
                ? `<@${player.id}> tried to cut a axe tree but it fell on them.`
                : `A axe fell on <@${player.id}>!`;

        },

        duelDay: function(attacker, target, round) {
            const damage = this.damage(round, 0);
            target.takeDamage(damage);

            return `<@${attacker.id}> throws a axe at <@${target.id}> with incredible force!`;
        },

        discovery: (player) => `<@${player.id}> discovered axe!`,

        night: function(player, round){
            const rng = Math.floor(Math.random() * 2);

            if(!rng) {
                return `<@${player.id}> slept peacefully through the night...`;
            } else{
                player.takeDamage(this.damage(round, 0));
                return `<@${player.id}> was sleeping and axe fell on them!`;
            }
            
        },

        feast: function(player, round){
            const healPoints = 7 * round;
            player.heal(healPoints);
            return `<@${player.id}> ate axe. Health has increased.`;
            
        },

        finalDuel: function(attacker, target, round) {
            const damage = this.damage(round, 0);
            target.takeDamage(20 * damage);

            return `<@${attacker.id}> throws a axe at <@${target.id}> with incredible force!`;
        }
    },

    
};

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

    heal(amount) {
        this.health = Math.min(100, this.health + amount );
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
        this.round = 0;
        this.collectors = [];
    }

    cleanupCollectors () {
        this.collectors.forEach(async (collector) => {
            if(!collector.ended){
                await collector.stop(); // triggers it's end ev.
            }
        });

        this.collectors = [];
    }

    updateLobbyMessage (message) {
        if(this.phase === 'lobby'){
            console.log(`Updating lobby message`);
                try {
                    const playerList = Array.from(this.players.values())
                        .map(p => `<@${p.id}>`)
                        .join('\n');
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`Lobby (${this.players.size}/24)`)
                        .setDescription(
                            `Host: <@${this.hoster}>\n\n` +
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
            
        }
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

    checkWinner(interaction) {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);
        if (alivePlayers.length === 1) {

            const winner = alivePlayers[0];

            const winnerEmbed = new EmbedBuilder()
                    .setTitle("**Hunger Games have ended!**")
                    .setDescription(`Congratulations to <@${winner.id}> for being the champion!`)
                    .setColor(0x953d59)
                    .setThumbnail(winner.avatar);

            interaction.channel.send({
                embeds:[winnerEmbed]
            });

            console.log(`Hunger games ended.`);
            workingHG = false;
            this.cleanupCollectors();
        
        } else if (alivePlayers.length === 0) {

            const allDeadEmbed = new EmbedBuilder()
                    .setTitle("**Hunger Games have ended!**")
                    .setDescription(`All players died. Ozzy won by default.`)
                    .setColor(0x953d59)
                    .setThumbnail(ozzyAvatarURL);

            interaction.channel.send({
                embeds:[allDeadEmbed]
            });

            console.log(`Hunger games ended.`);
            workingHG = false;
            this.cleanupCollectors();
            
        }
        return null; // More than one player alive, no winner yet
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

    async statMessage() {
        const alivePlayers = Array.from(this.players.values())
            .filter(p => p.alive)
            .sort((a,b) => b.health - a.health);

        const playerStats = alivePlayers.map(p => 
            `• <@${p.id}> - ${p.health}% HP`
        ).join('\n');

        const statEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`**Results**`)
        .addFields(
        { name: 'Players Alive', value: playerStats || 'No survivors!', inline: true }
        )
        .setFooter({ text: `Total alive: ${alivePlayers.length}` });

        return statEmbed;
    }
};

const GAME_EVENTS = {

    cornucopia: {

        execute: async(game, interaction) => {
            try{
                const weaponAssignments = [];
                const casualties = [];
                const weaponKeys = Object.keys(WEAPONS);
                game.players.forEach(player => {
                    const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                    weaponAssignments.push(selectedWeapon.discovery(player));
                    player.equipWeapon(selectedWeapon);
                    if (!player.alive) casualties.push(`⚰️ <@${player.id}>`);
                });

                const cornucopiaEmbed = new EmbedBuilder()
                    .setTitle("**Cornucopia**")
                    .setDescription(weaponAssignments.join('\n'));

                
                const message = await interaction.channel.send({
                    embeds: [cornucopiaEmbed],
                    components: [main],
                    fetchReply: true
                });

                const cornucopiaCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(cornucopiaCollector);

                cornucopiaCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[cornucopiaEmbed],
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
                                        game.phase = 'day';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            await game.transitionTo('day', interaction);
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

                cornucopiaCollector.on('end', async () => {

                    await message.edit({
                        embeds:[cornucopiaEmbed],
                        components:[done]
                    });

                    if(game.phase === 'cornucopia'){ // cornucopia timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });

            } catch (error) {
                console.error("Error during Cornucopia", error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
            }
        }

        
    },




    day: {

        execute: async(game, interaction) => {
            console.log("STARTING DAY", game.round);
            try{

                
                game.round++;
                console.log("Day round updated to", game.round);
                const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                console.log("Alive Players", alivePlayers.length);

                if(alivePlayers.length === 2){
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
                            fightLog.push(weapon.finalDuel(currentAttacker, currentDefender, game.round));
                            
                            if (!currentDefender.alive) {

                                const finalEmbed = new EmbedBuilder()
                                    .setTitle(`Final Showdown - Day ${game.round}`)
                                    .setDescription(fightLog.join('\n'))
                                    .setColor(0x953d59);

                                const finalMessage = await interaction.channel.send({
                                    embeds:[finalEmbed],
                                    components:[main]
                                });

                                const finalCollector = finalMessage.createMessageComponentCollector({
                                    filter: i => i.user.id === game.hoster,
                                    time: 300000
                                });
        
                                game.collectors.push(finalCollector);

                                finalCollector.on('end', () => {

                                    finalMessage.edit({
                                        embeds:[finalEmbed],
                                        components:[done]
                                    });
                
                                    if(game.phase === 'day'){ // stats timeout logic
                                        game.cleanupCollectors();
                                        workingHG = false;
                                        interaction.channel.send({ embeds: [timeoutEmbed]});
                                    }
                                });

                                finalCollector.on('collect', async i => {
                                    if(i.customId === 'next'){

                                        await i.deferUpdate();

                                        game.phase = 'winner';
                                        finalMessage.edit({
                                            embeds: [finalEmbed],
                                            components: [done]
                                        });

                                        game.checkWinner(interaction);
                                    }
                                })





                                
                            }
                            
                        }
                        [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
                    }
                    
                } else if(alivePlayers.length > 2) {

                    if(Math.random() < 0.5){ // single player fights

                        const weaponAssignments = [];
                        const casualties = [];
                        const weaponKeys = Object.keys(WEAPONS);
                        alivePlayers.forEach((player) => {
                            const playerWeapons = Array.from(player.weapons);
                            const currentWeapon = playerWeapons[Math.floor(Math.random() * playerWeapons.length)];
                            const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                            weaponAssignments.push(currentWeapon.singleDay(player, game.round));
                            weaponAssignments.push(selectedWeapon.discovery(player));
                            player.equipWeapon(selectedWeapon);
                            if (!player.alive) casualties.push(`⚰️ <@${player.id}>`);
                        });

                        const cornucopiaEmbed = new EmbedBuilder()
                            .setTitle(`**Day ${game.round} Events**`)
                            .setDescription(weaponAssignments.join('\n'));

                        
                        const message = await interaction.channel.send({
                            embeds: [cornucopiaEmbed],
                            components: [main],
                            fetchReply: true
                        });

                        const cornucopiaCollector = message.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: 300000
                        });

                        await game.collectors.push(cornucopiaCollector);

                        cornucopiaCollector.on('collect', async i => {
                            if(i.customId === 'next'){
                                await i.deferUpdate();
                                game.phase = 'deaths';
                                await message.edit({
                                    embeds:[cornucopiaEmbed],
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
                                    time: 3000000
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
                                                game.phase = 'night';

                                                game.cleanupCollectors();

                                                try{

                                                    
                                                    await statsMessage.edit({
                                                        embeds: [statsEmbed],
                                                        components: [done]
                                                    });

                                                    if(!game.checkWinner(interaction)){
                                                        await game.transitionTo('night', interaction);
                                                    }

                                               
                                                    
                                               } catch(error){
                                                console.error("Error during transitioningxxxxo.", error);
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

                        cornucopiaCollector.on('end', async () => {

                            await message.edit({
                                embeds:[cornucopiaEmbed],
                                components:[done]
                            });

                            if(game.phase === 'day'){ // cornucopia timeout logic
                                await game.cleanupCollectors();
                                workingHG = false;
                                await interaction.channel.send({ embeds: [timeoutEmbed]});
                            }
                        });



                    }
                    else {

                        const weaponAssignments = [];
                        const casualties = [];
                        const weaponKeys = Object.keys(WEAPONS);
                        
                        alivePlayers.forEach((player) => {
                            const possibleOpponents = alivePlayers.filter(p => p.id !== player.id);
                            const player2 = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)];
                            
                            const playerWeapons = Array.from(player.weapons);
                            const currentWeapon = playerWeapons[Math.floor(Math.random() * playerWeapons.length)];
                            const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                            weaponAssignments.push(currentWeapon.duelDay(player, player2, game.round));
                            weaponAssignments.push(selectedWeapon.discovery(player));
                            player.equipWeapon(selectedWeapon);
                            if (!player2.alive) casualties.push(`⚰️ <@${player2.id}>`);
                        });

                        const cornucopiaEmbed = new EmbedBuilder()
                            .setTitle(`**Day ${game.round} Events**`)
                            .setDescription(weaponAssignments.join('\n'));

                        
                        const message = await interaction.channel.send({
                            embeds: [cornucopiaEmbed],
                            components: [main],
                            fetchReply: true
                        });

                        const cornucopiaCollector = message.createMessageComponentCollector({
                            filter: i => i.user.id === game.hoster,
                            time: 300000
                        });

                        await game.collectors.push(cornucopiaCollector);

                        cornucopiaCollector.on('collect', async i => {
                            if(i.customId === 'next'){
                                await i.deferUpdate();
                                game.phase = 'deaths';
                                await message.edit({
                                    embeds:[cornucopiaEmbed],
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
                                    time: 3000000
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

                                                try{

                                                await i.deferUpdate();
                                                game.phase = 'night';
                                                game.cleanupCollectors();

                                                await statsMessage.edit({
                                                    embeds: [statsEmbed],
                                                    components: [done]
                                                });

                                                if(!game.checkWinner(interaction)){
                                                    await game.transitionTo('night', interaction);
                                                }
                                                
                                               } catch(error){
                                                console.error("Error during transitioningxxxxo.", error);
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

                        cornucopiaCollector.on('end', async () => {

                            await message.edit({
                                embeds:[cornucopiaEmbed],
                                components:[done]
                            });

                            if(game.phase === 'day'){ // cornucopia timeout logic
                                await game.cleanupCollectors();
                                workingHG = false;
                                await interaction.channel.send({ embeds: [timeoutEmbed]});
                            }
                        });

                        



                    }

                }  




            } catch (error) {
                console.error(`Error during Day ${game.round}`, error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
                throw error;
            }
        }

    },

    night: {

        execute: async(game, interaction) => {
            try{

                console.log("Day round updated to", game.round);
                const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                console.log("Alive Players", alivePlayers.length);

                const weaponAssignments = [];
                const casualties = [];
                const weaponKeys = Object.keys(WEAPONS);
                alivePlayers.forEach(player => {
                    const playerWeapons = Array.from(player.weapons);
                    const currentWeapon = playerWeapons[Math.floor(Math.random() * playerWeapons.length)];
                    const selectedWeapon = WEAPONS[weaponKeys[Math.floor(Math.random() * weaponKeys.length)]];
                    weaponAssignments.push(currentWeapon.night(player, game.round));
                    weaponAssignments.push(selectedWeapon.discovery(player));
                    player.equipWeapon(selectedWeapon);
                    if (!player.alive) casualties.push(`⚰️ <@${player.id}>`);
                });

                const cornucopiaEmbed = new EmbedBuilder()
                    .setTitle(`**Night ${game.round} Events**`)
                    .setDescription(weaponAssignments.join('\n'));

                
                const message = await interaction.channel.send({
                    embeds: [cornucopiaEmbed],
                    components: [main],
                    fetchReply: true
                });

                const cornucopiaCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(cornucopiaCollector);

                cornucopiaCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[cornucopiaEmbed],
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
                                        console.log("STARTING NIGHT TRANSITION");
                                        game.phase = 'undecided';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            if (!game.checkWinner(interaction)) {

                                                if(game.round % 2 === 0){
                                                    const randomNimbooz = Math.floor(Math.random() * 2);

                                                    if(randomNimbooz){
                                                        game.phase = 'feast';
                                                        await game.transitionTo('feast', interaction);
                                                    } else {
                                                        game.phase = 'bloodbath';
                                                        await game.transitionTo('bloodbath', interaction);
                                                    }
                                                } else {
                                                    game.phase = 'day';
                                                    await game.transitionTo('day', interaction);

                                                }
                                                
                                            }

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

                cornucopiaCollector.on('end', async () => {

                    await message.edit({
                        embeds:[cornucopiaEmbed],
                        components:[done]
                    });

                    if(game.phase === 'night'){ // night timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });

            } catch (error) {
                console.error("Error during Cornucopia", error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
            }
        }

        
    },

    feast: {

        execute: async(game, interaction) => {
            try{

                console.log("THE FEAST", game.round);
                const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                console.log("Alive Players", alivePlayers.length);

                const weaponAssignments = [];
                const casualties = [];
                const weaponKeys = Object.keys(WEAPONS);
                alivePlayers.forEach(player => {
                    const playerWeapons = Array.from(player.weapons);
                    const currentWeapon = playerWeapons[Math.floor(Math.random() * playerWeapons.length)];
                    weaponAssignments.push(currentWeapon.feast(player, game.round));
                    if (!player.alive) casualties.push(`⚰️ <@${player.id}>`);
                });

                const cornucopiaEmbed = new EmbedBuilder()
                    .setTitle(`**THE GREAT FEAST**`)
                    .setDescription(weaponAssignments.join('\n'));

                
                const message = await interaction.channel.send({
                    embeds: [cornucopiaEmbed],
                    components: [main],
                    fetchReply: true
                });

                const cornucopiaCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(cornucopiaCollector);

                cornucopiaCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[cornucopiaEmbed],
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
                                        game.phase = 'day';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            if (!game.checkWinner(interaction)) {
                                                await game.transitionTo('day', interaction);
                                            }

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

                cornucopiaCollector.on('end', async () => {

                    await message.edit({
                        embeds:[cornucopiaEmbed],
                        components:[done]
                    });

                    if(game.phase === 'feast'){ // feast timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });

            } catch (error) {
                console.error("Error during Cornucopia", error);
                workingHG = false;
                game.cleanupCollectors();
                interaction.channel.send({embeds: [crashEmbed]});
            }
        }

        
    },

    bloodbath: {

        execute: async(game, interaction) => {
            try{

                console.log("THE BLOODYBOY", game.round);
                const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
                console.log("Alive Players", alivePlayers.length);

                const weaponAssignments = [];
                const casualties = [];
                const characterKeys = Object.keys(CHARACTERS);
                alivePlayers.forEach(player => {
                    const rng = Math.floor(Math.random() * 2)
                    const selectedCharacter = CHARACTERS[characterKeys[Math.floor(Math.random() * characterKeys.length)]];
                    weaponAssignments.push(selectedCharacter(player, rng));
                    if (!player.alive) casualties.push(`⚰️ <@${player.id}>`);
                });

                const cornucopiaEmbed = new EmbedBuilder()
                    .setTitle(`**THE BLOODBATH**`)
                    .setDescription(weaponAssignments.join('\n'));

                
                const message = await interaction.channel.send({
                    embeds: [cornucopiaEmbed],
                    components: [main],
                    fetchReply: true
                });

                const cornucopiaCollector = message.createMessageComponentCollector({
                    filter: i => i.user.id === game.hoster,
                    time: 300000
                });

                await game.collectors.push(cornucopiaCollector);

                cornucopiaCollector.on('collect', async i => {
                    if(i.customId === 'next'){
                        await i.deferUpdate();
                        game.phase = 'deaths';
                        await message.edit({
                            embeds:[cornucopiaEmbed],
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
                                        game.phase = 'day';

                                        
                                        try {
                                            await statsMessage.edit({
                                            embeds: [statsEmbed],
                                            components: [done]
                                            });

                                            console.log("Before transitionTo");

                                            if (!game.checkWinner(interaction)) {
                                                await game.transitionTo('day', interaction);
                                            }

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

                cornucopiaCollector.on('end', async () => {

                    await message.edit({
                        embeds:[cornucopiaEmbed],
                        components:[done]
                    });

                    if(game.phase === 'bloodbath'){ // bloodbath timeout logic
                        await game.cleanupCollectors();
                        workingHG = false;
                        await interaction.channel.send({ embeds: [timeoutEmbed]});
                    }
                });

            } catch (error) {
                console.error("Error during Cornucopia", error);
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



// main exec block
export default  {

    data: new SlashCommandBuilder()
    .setName('hungertest')
    .setDescription('test'),

    async execute(interaction, client){
        await interaction.deferReply();

        const member = interaction.member;
        if(member.roles.cache.has(allowedRoles[0])){
            hoster = interaction.user.id;
            console.log('Hoster ID has been set:', hoster);
            if(!workingHG){
                try{

                    console.log(`test`);

                    const game = new GameState(hoster);

                    console.log(`test`);

                    let startEmbed = new EmbedBuilder()
                        .setTitle("Hunger Games")
                        .setDescription(`
                            **The Reaping**
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
                        if(!game.players.has(user.id)){
                            console.log(`Player <@${user.id}> is joining the game...`);
                            game.players.set(user.id, new Player (user.id, user.displayAvatarURL()));
                            console.log(`Player <@${user.id}> has joined the game!`);
                            game.updateLobbyMessage(message);    

                        }

                    });

                    ozzyCollector.on('collect', (reaction, user) => {
                        console.log(`We have started taking Ozzy reactions!`);
                        if(!game.players.has(OZZY_ID) && user.id === game.hoster){
                            game.players.set(OZZY_ID, new Player (OZZY_ID, ozzyAvatarURL));
                            console.log(`Ozzy has joined the game.`);
                            game.updateLobbyMessage(message);

                        }
                    });

                    startCollector.on('collect', (reaction, user) => {
                        if(game.players.size >= 2){
                            console.log(`We are starting the game almost.`);
                            if(user.id === game.hoster){
                                console.log(`We started.`);
                                game.phase = 'cornucopia';
                                try{
                                    game.transitionTo('cornucopia', interaction);
                                } catch(error) {
                                    console.error("Failed to transition", error);
                                    workingHG = false;
                                    this.cleanupCollectors();
                                    interaction.channel.send({embeds: [crashEmbed]});

                                }
                            }
                        }        
                    });

                    startCollector.on("end", (collected, reason) =>{
                        console.log(`stopped join collect`);
                        if(game.phase === 'lobby'){
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