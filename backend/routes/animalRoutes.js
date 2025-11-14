const express = require('express');
const router = express.Router();
const Animal = require('../models/animals');
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  validateAnimalCreate,
  validateAnimalUpdate,
  validateAnimalDelete
} = require('../middleware/validators/animalValidator');

// Create new animal record
router.post(
  '/',
  validateAnimalCreate,
  asyncWrapper(async (req, res) => {
    const animal = await Animal.create(req.body);
    res.status(201).json({ success: true, data: animal });
  })
);

// Get all animals
router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const animals = await Animal.find().populate('farmId', 'name location');
    res.status(200).json({ success: true, count: animals.length, data: animals });
  })
);

// Get animal by ID
router.get(
  '/:id',
  asyncWrapper(async (req, res) => {
    const animal = await Animal.findById(req.params.id).populate('farmId', 'name location');
    if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.status(200).json({ success: true, data: animal });
  })
);

// Update animal
router.put(
  '/:id',
  validateAnimalUpdate,
  asyncWrapper(async (req, res) => {
    const updated = await Animal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.status(200).json({ success: true, data: updated });
  })
);

//  Delete animal
router.delete(
  '/:id',
  validateAnimalDelete,
  asyncWrapper(async (req, res) => {
    const deleted = await Animal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.status(200).json({ success: true, message: 'Animal deleted successfully' });
  })
);

module.exports = router;
