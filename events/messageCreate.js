import { Events, AttachmentBuilder } from 'discord.js';
import userLevelModel from '../models/levelSchema.js';
import canvasPackage from '@napi-rs/canvas';
const { createCanvas, loadImage, GlobalFonts } = canvasPackage;


const excludedChannels = ['1252905546143502407'];
GlobalFonts.registerFromPath('./fonts/burbank.otf', 'Burbank' );
GlobalFonts.registerFromPath('./fonts/loyola.otf', 'Loyola');
GlobalFonts.registerFromPath('./fonts/1942.ttf', '1942');

const cooldowns = new Map();

const totalXpRequired = [
  30, 50000
];

const backgroundURL = 'https://i.imgur.com/T5LnYtI.png'; 

const footers = [
    "Keep chatting to level up more!",
    "The journey to the top continues!",
    "Next level awaits!",
    "You're on fire!",
    "Chat master in the making!"
];

async function createLevelUpImage(user, level) {
    
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    try {
        const background = await loadImage(backgroundURL);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error('Error loading background:', error);
    }

    try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save(); 
        ctx.beginPath();
        ctx.arc(97, 97, 60, 0, Math.PI * 2, true); // this sets the profile picture size (circle).
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 37, 37, 120, 120); // this sets the focus on the pfp. left top of pfp aligns to left top of circle.
        ctx.restore(); 
        
        ctx.beginPath();
        ctx.arc(97, 97, 60, 0, Math.PI * 2, true); // needs to match the circle dims.
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    } catch (error) {
        console.error('Error loading avatar:', error);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    // header text (congratulations)
    ctx.font = 'bold 22px "Burbank"';
    ctx.textAlign = 'center';
    ctx.strokeText(`Congratulations ${user.username}!`, canvas.width/2 + 205, 48);
    ctx.fillText(`Congratulations ${user.username}!`, canvas.width/2 + 205, 48);

    ctx.lineWidth = 5;

    // "LEVEL X" text (big center)
    ctx.font = 'bold 82px "Loyola"';
    ctx.strokeText(`LEVEL ${level}`, canvas.width/2-30, 173);
    ctx.fillText(`LEVEL ${level}`, canvas.width/2-30, 173);

    ctx.lineWidth = 3;

    // random footer text 
    ctx.font = 'italic 22px "1942"';
    const randomFooter = footers[Math.floor(Math.random() * footers.length)];
    ctx.strokeText(randomFooter, canvas.width/2, 270);
    ctx.fillText(randomFooter, canvas.width/2, 270);

    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer, { name: 'levelup.png' });
}


export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        let levelModel = await userLevelModel.findOne({ userId: message.author.id });
        if (!levelModel) {
            levelModel = new userLevelModel({
                userId: message.author.id,
                level: 0,
                xp: 0,
            });
            await levelModel.save();
        }

        if(excludedChannels.includes(message.channel.id)) return;

        const now = Date.now();
        const cooldownAmount = 5000;
        const usercooldown = cooldowns.get(message.author.id) || 0;

        if (usercooldown > now) {
            return;
        }

        cooldowns.set(message.author.id, now + cooldownAmount);

        try {
            const xpGained = Math.floor(Math.random() * 9) + 18;
            levelModel.xp += xpGained;
            console.log(`XP given to ${message.author.tag}. Total XP: ${levelModel.xp}`);

            let totalXPForNextLevel = totalXpRequired[levelModel.level + 1];
            console.log(`Total XP required for next level: ${totalXPForNextLevel}`);

            let xpToNextLevel = totalXPForNextLevel - levelModel.xp;
            console.log(`XP needed for next level: ${xpToNextLevel}`);

            if (levelModel.xp >= totalXPForNextLevel) {
                levelModel.level += 1;

                const levelUpImage = await createLevelUpImage(message.author, levelModel.level);
                await message.channel.send({
                    content: `Congratulations ${message.author}, you leveled up to level ${levelModel.level}!`,
                    files: [levelUpImage]
                });
            }

            await levelModel.save();
        } catch (error) {
            console.error(`Error updating XP for user ${message.author.tag}:`, error);
        }

        
    }
}