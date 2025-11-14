const express = require('express');
const router = express.Router();
const Farm = require('../models/farms');
const asyncWrapper = require('../middleware/asyncWrapper');
const auth = require('../middleware/auth');
const { validateFarmCreate, validateFarmUpdate } = require('../middleware/validators/farmValidator');

// Create farm
router.post('/', auth, validateFarmCreate, asyncWrapper(async (req, res) => {
  const { name, location } = req.body;
  
  // Use the authenticated user's ID as the farmerId
  const farmerId = req.user._id;

  // Create the new farm with authenticated user's ID
  const farmData = {
    ...req.body,
    farmerId
  };
  
  const farm = await Farm.create(farmData);

  res.status(201).json({
    success: true,
    message: 'Farm created successfully',
    data: farm
  });
}));

// Get farms for the authenticated user only
router.get('/', auth, asyncWrapper(async (req, res) => {
  const userId = req.user._id;
  
  const farms = await Farm.find({ farmerId: userId })
    .populate('farmerId', 'firstName lastName email');

  if(!farms || farms.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No farms found for this user'
    });
  }

  // Get counts of crops and animals for each farm
  const Crop = require('../models/crops');
  const Animal = require('../models/animals');
  
  const farmsWithCounts = await Promise.all(farms.map(async (farm) => {
    const [cropsCount, animalsCount] = await Promise.all([
      Crop.countDocuments({ farmId: farm._id }),
      Animal.countDocuments({ farmId: farm._id })
    ]);
    
    return {
      ...farm.toObject(),
      cropsCount,
      animalsCount
    };
  }));

  res.status(200).json({
    success: true,
    count: farmsWithCounts.length,
    data: farmsWithCounts
  });
}));

// Get a single farm by ID
router.get('/:id', asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id)
    .populate('farmerId', 'name email')
    .populate('crops', 'name type')
    .populate('animals', 'name species');

  if (!farm) {
    return res.status(404).json({ 
        success: false, 
        message: 'Farm not found' 
    });
  }

  res.status(200).json({ success: true, data: farm });
}));

// Update a farm
router.put('/:id', validateFarmUpdate, asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const updatedFarm = await Farm.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updatedFarm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Farm updated successfully',
    data: updatedFarm
  });
}));

// Delete a farm
router.delete('/:id', asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const deletedFarm = await Farm.findByIdAndDelete(id);

  if (!deletedFarm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Farm deleted successfully'
  });
}));

module.exports = router;
