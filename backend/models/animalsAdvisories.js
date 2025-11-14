const mongoose = require('mongoose');

const animalAdvisorySchema = new mongoose.Schema({
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    advisoryType: { 
        type: String, 
        enum: ['vaccination', 'feeding', 'housing', 'disease_prevention', 'breeding', 'weather_related'] 
    },
    title: String, 
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    
    weatherTrigger: {
        condition: { type: String, enum: ['rainy_season', 'cold_spell', 'heat_wave'] },
        daysBefore: Number, 
        message: String 
    },
    
    recommendedActions: [{
        action: String, 
        timing: String, 
        frequency: String, 
    }],
    
    // Medical specifics
    diseasePrevention: {
        diseaseName: String,
        symptoms: [String], 
        preventionMethods: [String],
        treatmentOptions: [String]
    },
    
    timing: {
        dueDate: Date,
        completedDate: Date,
        nextDueDate: Date,
        urgency: { type: String, enum: ['immediate', 'soon', 'planned'] }
    }
},{timestamps: true});

const AnimalAdvisory = mongoose.model('animalAdvisory', animalAdvisorySchema);
module.exports = AnimalAdvisory;