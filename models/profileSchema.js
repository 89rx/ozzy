import mongoose from 'mongoose';
import { AttachmentBuilder } from 'discord.js';

const profileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    sapphires: { type: Number, default: 0, min: 0},
    weeklySapphires: {type: Number, default: 0, min: 0, index: -1},
    }
);

profileSchema.methods = {

    addSapphires: async function(amount) {
        if (amount < 0) throw new Error('Cannot add a negative amount of sapphires');
        this.sapphires += amount;
        this.weeklySapphires += amount;
        await this.save();
        return this;
    },

    removeSapphires: async function(amount) {
        if (amount < 0) throw new Error('Cannot remove a negative amount of sapphires');
        if (this.sapphires < amount) throw new Error('Not enough sapphires to remove');
        this.sapphires -= amount;
        this.weeklySapphires -= amount;
        await this.save();
        return this;
    },

    getSapphireBalances: async function() {
        return {
            sapphires: this.sapphires,
            weeklySapphires: this.weeklySapphires,
        };
    },
};

profileSchema.statics = {

    getLeaderboard: async function(limit = 10) {
        return this.find({})
            .sort({ sapphires: -1 })
            .limit(limit)
            .select('userId sapphires')
            .exec();
    },

    getWeeklyLeaderboard: async function(limit = 10) {
        return this.find({})
            .sort({ weeklySapphires: -1 })
            .limit(limit)
            .select('userId weeklySapphires')
            .exec();
    },

    resetWeeklySapphires: async function(client) {

        try{

            const weeklyData = await this.find({ weeklySapphires: { $gt: 0 } })
                .select('userId weeklySapphires')
                .lean();
                
            if (weeklyData.length === 0) {
                return 0; 
            }

            const backup = {
                timestamp: new Date(),
                data: weeklyData
            }

            const jsonString = JSON.stringify(backup, null, 2);

            const result = await this.updateMany(
                { weeklySapphires: { $gt: 0}}, 
                { $set: { weeklySapphires: 0 } }
            );

            const buffer = Buffer.from(jsonString, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `weekly_backup_${new Date().toISOString()}.json` });
            const channelID = '1388586350915223637';

            const channel = await client.channels.fetch(channelID);
            if (!channel) {
                throw new Error('Channel not found');
            }

            await channel.send({
                content: 'Weekly sapphires have been reset. Backup created:',
                files: [attachment]
            });

            return result.modifiedCount;
        }
        
        catch (error) {
            console.error('Error resetting weekly sapphires:', error);
            throw new Error('Failed to reset weekly sapphires');
        }

        
    },


};





const userSapphireModel = mongoose.model('sapphires', profileSchema);
export default userSapphireModel;