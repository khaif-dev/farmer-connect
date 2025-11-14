const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketListing', required: true },
    buyerId: { type: ObjectId, ref: 'User', required: true },
    farmerId: { type: ObjectId, ref: 'User', required: true },
    productType: String,
    quantity: Number,
    unitPrice: Number,
    totalAmount: Number,
    commission: Number, 
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, enum: ['mpesa', 'bank_transfer', 'cash'] },
    deliveryStatus: { 
        type: String, 
        enum: ['scheduled', 'in_transit', 'delivered', 'cancelled'], 
        default: 'scheduled' 
    },
    deliveryDate: Date,
    rating: {
        fromBuyer: { score: Number, comment: String },
        fromFarmer: { score: Number, comment: String }
    }
},{ timestamps:true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;