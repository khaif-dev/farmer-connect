// animals model

const mongoose = require('mongoose');
const { Schema } = mongoose;

const animalSchema = new Schema({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  type: { type: String, required: true },
  breed: String,
  number: Number,
  ageGroup: String, 
  lastVaccinationDate: Date,
  nextVaccinationDate: Date,
  notes: String
}, { timestamps: true });

const Animal = mongoose.model('Animal', animalSchema);
module.exports =  Animal;

