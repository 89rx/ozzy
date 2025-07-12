import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import  userSapphireModel  from '../models/profileSchema.js';

export default {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Sapphire management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add sapphires to a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to add sapphires to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('The amount of sapphires to add')
                        .setMinValue(1)
                        .setRequired(true))

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove sapphires from a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to remove sapphires from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('The amount of sapphires to remove')
                        .setMinValue(1)
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('resetweekly')
                .setDescription('Reset weekly sapphires for all users')
        ), 
        
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const embed = new EmbedBuilder()
            .setColor(`#${randomColor.padStart(6, '0')}`);
        
        if (subcommand === 'add' || subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const userID = interaction.user.id;
            const amount = interaction.options.getInteger('amount');

            try {
                const profile = await userSapphireModel.findOne({ userId: user.id });

                if (!profile) {
                    profile = new userSapphireModel({
                        userId: user.id,
                        sapphires: 0,
                        weeklySapphires: 0
                    });
                }

                if (subcommand === 'add') {
                    await profile.addSapphires(amount);
                    embed.setDescription(`Added ${amount} sapphires to <@${userID}>.`);
                    return interaction.reply({ embeds: [embed] });
                } else if (subcommand === 'remove') {
                    await profile.removeSapphires(amount);
                    embed.setDescription(`Removed ${amount} sapphires from <@${userID}>.`);
                    return interaction.reply({ embeds: [embed]});
                }
            } catch (error) {
                console.error(`Error executing ${subcommand} command for user <@${userID}>:`, error);
                return interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
            }
        }

        else if (subcommand === 'resetweekly') {
            try {
                const result = await userSapphireModel.resetWeeklySapphires(interaction.client);
                return interaction.reply({ content: `Reset weekly sapphires for all users. ${result} users updated.` });
            } catch (error) {
                console.error('Error resetting weekly sapphires:', error);
                return interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
            }
        } 
        
        else {
            return interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
        }    
    }

}