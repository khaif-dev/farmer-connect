const { body, validationResult } = require('express-validator');
// validate the objectId
const mongoose = require('mongoose'); 

// Reusable validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// Utility to check valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Validate Farm creation
exports.validateFarmCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Farm name is required')
    .isLength({ min: 2 }).withMessage('Farm name must be at least 2 characters long'),

  body('size')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Farm size must be a positive number'),

  body('soilType')
    .optional()
    .isIn(["Black Cotton", "Red Soil", "Sandy Soil", "Loamy Soil", "Volcanic Soils"])
    .withMessage('Invalid soil type'),

  body('elevation')
    .optional()
    .isNumeric().withMessage('Elevation must be a number'),

  // Nested location validation
  body('location.county')
    .optional()
    .isString().withMessage('County must be a string'),

  body('location.subCounty')
    .optional()
    .isString().withMessage('Sub-county must be a string'),

  // Farmer ID (now optional since we get it from auth middleware)
    body('farmerId')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid farmer ID'),

  // Crops and animals as array of ObjectIds
  body('crops')
    .optional()
    .isArray().withMessage('Crops must be an array of IDs')
    .custom(arr => arr.every(id => isValidObjectId(id)))
    .withMessage('Crops must contain valid ObjectIds'),

  body('animals')
    .optional()
    .isArray().withMessage('Animals must be an array of IDs')
    .custom(arr => arr.every(id => isValidObjectId(id)))
    .withMessage('Animals must contain valid ObjectIds'),

  handleValidationErrors
];

// Validate Farm update
exports.validateFarmUpdate = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('size').optional().isFloat({ gt: 0 }).withMessage('Size must be positive'),
  body('soilType').optional().isIn(["Black Cotton", "Red Soil", "Sandy Soil", "Loamy Soil", "Volcanic Soils"]),
  body('elevation').optional().isNumeric(),

  body('location.county').optional().isString(),
  body('location.subCounty').optional().isString(),

  body('crops')
    .optional()
    .isArray()
    .custom(arr => arr.every(id => isValidObjectId(id))),
    
  body('animals')
    .optional()
    .isArray()
    .custom(arr => arr.every(id => isValidObjectId(id))),

  handleValidationErrors
];
