const express = require('express');
const router = express.Router();
const BuyerOffer = require('../models/buyerOffer');
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  validateBuyerOfferCreate,
  validateBuyerOfferUpdate,
  validateBuyerOfferDelete
} = require('../middleware/validators/buyerOfferValidator');

// Create new offer
router.post(
  '/',
  validateBuyerOfferCreate,
  asyncWrapper(async (req, res) => {
    const offer = await BuyerOffer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  })
);

// Get all offers
router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const offers = await BuyerOffer.find().populate('buyerId', 'name email');
    res.status(200).json({ success: true, data: offers });
  })
);

// Get single offer
router.get(
  '/:id',
  asyncWrapper(async (req, res) => {
    const offer = await BuyerOffer.findById(req.params.id).populate('buyerId', 'name email');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
  })
);

// Update offer
router.put(
  '/:id',
  validateBuyerOfferUpdate,
  asyncWrapper(async (req, res) => {
    const updated = await BuyerOffer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: updated });
  })
);

// Delete offer
router.delete(
  '/:id',
  validateBuyerOfferDelete,
  asyncWrapper(async (req, res) => {
    const deleted = await BuyerOffer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  })
);

module.exports = router;
