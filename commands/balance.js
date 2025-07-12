import { SlashCommandBuilder } from 'discord.js';
import userSapphireModel from '../models/profileSchema.js'; 

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your sapphire balance'),

    async execute(interaction) {
        try {
            const profile = await userSapphireModel.findOne({ userId: interaction.user.id });

            if (!profile) {
                profile = newuserSapphireModel({
                    userId: interaction.user.id,
                    sapphires: 0,
                    weeklySapphires: 0,
            });

            await profile.save();
            }

            const balances = await profile.getSapphireBalances();
            await interaction.reply({
                content: `You have ${balances.sapphires} sapphires and ${balances.weeklySapphires} sapphires this week.`,
                ephemeral: false
            });
        } catch (error) {
            console.error('Error executing balance command:', error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}