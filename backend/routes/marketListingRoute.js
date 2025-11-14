const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const auth = require('../middleware/auth');
const MarketListing = require('../models/marketListing');
const {
  validateMarketListingCreate,
  validateMarketListingUpdate,
  validateMarketListingDelete
} = require('../middleware/validators/marketListingValidator');

// Create a new market listing
router.post('/', auth, asyncWrapper(async (req, res) => {
  // Add user ID and type from JWT token
  const listingData = {
    ...req.body,
    userId: req.user._id,
    userType: req.user.userType
  };
  
  const listing = await MarketListing.create(listingData);
  res.status(201).json({
    success: true,
    message: 'Market listing created successfully',
    data: listing
  });
}));

// Get all listings
router.get('/', asyncWrapper(async (req, res) => {
  const listings = await MarketListing.find()
    .populate('userId', 'firstName lastName email userType')
    .populate('farmId', 'name location')
    .populate('institutionName', 'name type'); // This will be populated from user details

  if (!listings.length) {
    return res.status(404).json({ success: false, message: 'No listings found' });
  }

  res.status(200).json({ success: true, count: listings.length, data: listings });
}));

// Get single listing
router.get('/:id', asyncWrapper(async (req, res) => {
  const listing = await MarketListing.findById(req.params.id)
    .populate('userId', 'firstName lastName email userType')
    .populate('farmId', 'name location');

  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }

  res.status(200).json({ success: true, data: listing });
}));

// Update listing
router.put('/:id', validateMarketListingUpdate, asyncWrapper(async (req, res) => {
  const listing = await MarketListing.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }

  res.status(200).json({ success: true, message: 'Listing updated successfully', data: listing });
}));

// Delete listing
router.delete('/:id', validateMarketListingDelete, asyncWrapper(async (req, res) => {
  const listing = await MarketListing.findByIdAndDelete(req.params.id);

  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }

  res.status(200).json({ success: true, message: 'Listing deleted successfully' });
}));

// Get current user's listings (authenticated user)
router.get('/user/listings', auth, asyncWrapper(async (req, res) => {
  const listings = await MarketListing.find({ userId: req.user._id })
    .populate('userId', 'firstName lastName email userType')
    .populate('farmId', 'name location');

  if (!listings.length) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  res.status(200).json({ success: true, count: listings.length, data: listings });
}));

module.exports = router;
