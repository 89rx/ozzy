import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import userSapphireModel from '../models/profileSchema.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the sapphire leaderboard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('total')
                .setDescription('Top 10 users with the most sapphires.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weekly')
                .setDescription('Top 10 users with the most sapphires this week.')),    
        

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const embed = new EmbedBuilder()
            .setColor(`#${randomColor.padStart(6, '0')}`)
            .setTimestamp()
            .setFooter({ text: 'Zipline Statistics', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        if (subcommand !== 'total' && subcommand !== 'weekly') {
            return interaction.reply({ content: 'Invalid subcommand. Use `/leaderboard total` or `/leaderboard weekly`.', ephemeral: true });
        }

        

        else if (subcommand === 'weekly')
            try {
                const profiles = await userSapphireModel.find().sort({ weeklySapphires: -1 }).limit(10);
                if (profiles.length === 0) {
                return interaction.reply({ content: 'No users found on the weekly leaderboard.', ephemeral: true });
                }

                const leaderboard = profiles.map((profile, index) => `${index + 1}. <@${profile.userId}>: ${profile.weeklySapphires} 💎`).join('\n');

                embed
                    .setTitle('Weekly Sapphire Leaderboard')
                    .setDescription(leaderboard)
                    
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error executing weekly leaderboard command:', error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                
            } 
            
        else if (subcommand === 'total'){
            try {
                const profiles = await userSapphireModel.find().sort({ sapphires: -1 }).limit(10);
                if (profiles.length === 0) {
                    return interaction.reply({ content: 'No users found on the leaderboard.', ephemeral: true });
                }

                const leaderboard = profiles.map((profile, index) => `${index + 1}. <@${profile.userId}>: ${profile.sapphires} 💎`).join('\n');
                embed
                    .setTitle('Total Sapphire Leaderboard')
                    .setDescription(leaderboard);
                await interaction.reply({  embeds: [embed] });
            } catch (error) {
                console.error('Error executing leaderboard command:', error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }    
    }
}