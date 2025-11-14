const mongoose = require('mongoose');
const { Schema } = mongoose;

const marketListingSchema = new Schema({
  // Common fields for both farmers and buyers
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userType: { type: String, enum: ['farmer', 'buyer'], required: true },

  // Farmer-specific fields
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm' },

  // Buyer-specific fields
  institutionName: { type: String },
  institutionType: { 
    type: String, 
    enum: ['school', 'restaurant', 'hotel', 'supermarket', 'exporter', 'individual'] 
  },

  location: {
    county: { type: String },
    subCounty: { type: String },
    coordinate: {
      lat: { type: Number },
      long: { type: Number }
    }
  },

  product: {
    name: { type: String, required: true },
    status: { type: String, enum: ['ready to harvest', 'harvested'], default: 'harvested' }
  },

  quantity: {
    amount: { type: Number, required: true },
    unit: { 
      type: String, 
      enum: ['kg', 'tons', 'bundles', 'crates', 'liters', 'heads', 'tray'],
      required: true
    }
  },

  pricePerUnit: { type: Number, required: true },

  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'supplied', 'expired'],
    default: 'available'
  },

  images: [String],
  description: String

}, { timestamps: true });

// Add validation to ensure farmId is present for farmers
marketListingSchema.pre('validate', function(next) {
  if (this.userType === 'farmer' && !this.farmId) {
    this.invalidate('farmId', 'Farm selection is required for farmers');
  }
  if (this.userType === 'buyer' && (!this.institutionName || !this.institutionType)) {
    this.invalidate('institutionName', 'Institution details are required for buyers');
  }
  next();
});

MarketListing = mongoose.model('MarketListing', marketListingSchema);
module.exports = MarketListing;
