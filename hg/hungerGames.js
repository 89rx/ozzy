import { SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { WEAPONS } from './weapons.js';
import { GameState, GAME_EVENTS } from './gameState.js';




//initializing game files

const ozzyAvatar = new AttachmentBuilder(ozzyPath);

// allowed roles who can do the command
const allowedRoles = ['1253511342795784256'];

const joinEmoji = `🏹`;
const startEmoji = `⚔️`;
const addOzzyEmoji = `🗡`;
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

export const main = new ActionRowBuilder()
    .addComponents(createButtons().next);
export const done = new ActionRowBuilder()
    .addComponents(createButtons().nextDisabled); 
    
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
}    


            

            


    
    
