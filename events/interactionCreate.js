import { Events } from 'discord.js';
import userSapphireModel from '../models/profileSchema.js';


export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        let  profile = await userSapphireModel.findOne({ userId: interaction.user.id });
        if (!profile) {
            profile = new userSapphireModel({
                userId: interaction.user.id,
                sapphires: 0,
                weeklySapphires: 0,
            });
            await profile.save();
        }

        try {
            await command.execute(interaction, profile);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
            
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    content: '❌ Command failed after execution started',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to execute command',
                    ephemeral: true
                });
            }
        }
    }
};