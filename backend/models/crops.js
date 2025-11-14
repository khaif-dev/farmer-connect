const mongoose = require('mongoose');
const { Schema } = mongoose;

const cropSchema = new Schema({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    type: { type: String, required: true },
    variety: String,
    plantingDate: Date,
    expectedHarvestingDate: Date,
    area: Number, 
    status: { type: String, enum: ['planted', 'growing', 'ready', 'harvested'], default: 'planted' },
    notes: String
}, {timestamps: true});

const Crop = mongoose.model('Crop', cropSchema);
module.exports = Crop;