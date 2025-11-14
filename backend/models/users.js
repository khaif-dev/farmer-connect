// models/users.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, unique: true },
  phone:     { type: String, unique: true, required: true },
  password:  { type: String, required: true },
  userType:  { type: String, enum: ['farmer', 'buyer'], default: 'farmer' },

  profile: {
    username: String,
    avatar: String
  },

  location: {
    county: String,
    subCounty: String,
    coordinate: {
      lat: Number,
      long: Number
    }
  },

  // 🔹 Add buyer-specific details
  buyerDetails: {
    institutionType: { 
      type: String, 
      enum: ['school', 'restaurant', 'hotel', 'supermarket', 'exporter', 'individual']
    },
    purchaseInterests: [String]
  },

  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    expires: Date,
    paymentMethod: String
  },

  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hash before saving update
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

