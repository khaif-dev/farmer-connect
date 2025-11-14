const mongoose = require('mongoose');

const buyerOfferSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerType: { type: String, enum: ['school', 'restaurant', 'hotel', 'supermarket', 'exporter'] },
    product: String,
    quantity: { 
        type: Number, 
        unit: { type: String,  enum: ['kg', 'tons', 'bundles', 'crates', 'liters', 'tray', 'head']}
    },
    qualityGrade: String,
    maxPricePerUnit: Number,
    deliveryLocation: {
        name: String, 
        county: String,
        coordinates: {
        lat: Number,
        lng: Number
        }
    },
    deliveryDate: Date,
    frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'] },
    status: { type: String, enum: ['active', 'fulfilled', 'cancelled'], default: 'active' },
    description: String
},{ timestamps:true });

const BuyerOffer = mongoose.model('buyerOffer', buyerOfferSchema);
module.exports = BuyerOffer;