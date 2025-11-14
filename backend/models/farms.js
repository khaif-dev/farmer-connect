const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmSchema = new Schema({
  name: { type: String, required: true },
  size: Number,
  soilType: { 
    type: String, 
    enum: ["Black Cotton", "Red Soil", "Sandy Soil", "Loamy Soil", "Volcanic Soils"] 
  },
  elevation: Number,

  location: {
    county: String,
    subCounty: String
  },

  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  crops: { type: Schema.Types.ObjectId, ref: 'Crop' },
  animals: { type: Schema.Types.ObjectId, ref: 'Animal' },
}, { timestamps: true });

// Create a geospatial index for coordinate field
const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm ;