const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  cropType: { type: String, required: true },

  advisoryType: { 
    type: String, 
    enum: ['planting', 'harvesting', 'irrigation', 'fertilizer', 'pest_control', 'disease_prevention'], 
    required: true
  },

  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },

  title: { type: String, required: true },
  description: String,

  recommendedActions: [{
    action: String,
    timing: String,
    frequency: String
  }],

  timing: {
    startDate: Date,
    endDate: Date,
    urgency: { type: String, enum: ['immediate', 'soon', 'planned'] }
  },

  weatherConditions: {
    optimalTemp: { min: Number, max: Number },
    optimalRainfall: { min: Number, max: Number },
    optimalHumidity: { min: Number, max: Number }
  },

  isCompleted: { type: Boolean, default: false }

}, { timestamps: true });

const CropAdvisory = mongoose.model('CropAdvisory', cropAdvisorySchema);
module.exports = CropAdvisory;
