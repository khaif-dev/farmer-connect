const express = require('express');
const router = express.Router();
const Crop = require('../models/crops');
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  validateCropCreate,
  validateCropUpdate,
  validateCropDelete
} = require('../middleware/validators/cropValidator');

// Create crop
router.post(
  '/',
  validateCropCreate,
  asyncWrapper(async (req, res) => {
    const crop = await Crop.create(req.body);
    res.status(201).json({ success: true, data: crop });
  })
);

// Get all crops
router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const crops = await Crop.find().populate('farmId', 'name location');
    res.status(200).json({ success: true, count: crops.length, data: crops });
  })
);

// Get crop by ID
router.get(
  '/:id',
  asyncWrapper(async (req, res) => {
    const crop = await Crop.findById(req.params.id).populate('farmId', 'name location');
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.status(200).json({ success: true, data: crop });
  })
);

// Update crop
router.put(
  '/:id',
  validateCropUpdate,
  asyncWrapper(async (req, res) => {
    const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.status(200).json({ success: true, data: updated });
  })
);

// Delete crop
router.delete(
  '/:id',
  validateCropDelete,
  asyncWrapper(async (req, res) => {
    const deleted = await Crop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.status(200).json({ success: true, message: 'Crop deleted successfully' });
  })
);

module.exports = router;
