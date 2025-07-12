import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 0, min: 0 },
    xp: { type: Number, default: 0, min: 0 },

});

const userLevelModel = mongoose.model('userlevel', levelSchema);

export default userLevelModel;