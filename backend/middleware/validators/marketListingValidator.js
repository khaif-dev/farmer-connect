// middleware/validators/marketListingValidator.js
const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Reusable validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Utility function to check valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// CREATE validator
exports.validateMarketListingCreate = [
  body('userId')
    .optional()
    .custom(value => isValidObjectId(value))
    .withMessage('Invalid user ID'),

  body('userType')
    .optional()
    .isIn(['farmer', 'buyer']).withMessage('User type must be either farmer or buyer'),

  // Farmer-specific validations
  body('farmId')
    .if(body('userType').equals('farmer'))
    .notEmpty().withMessage('Farm ID is required for farmers')
    .custom(value => isValidObjectId(value))
    .withMessage('Invalid farm ID'),

  // Buyer-specific validations
  body('institutionName')
    .if(body('userType').equals('buyer'))
    .notEmpty().withMessage('Institution name is required for buyers')
    .isLength({ min: 2, max: 100 }).withMessage('Institution name must be 2-100 characters'),

  body('institutionType')
    .if(body('userType').equals('buyer'))
    .notEmpty().withMessage('Institution type is required for buyers')
    .isIn(['school', 'restaurant', 'hotel', 'supermarket', 'exporter', 'individual'])
    .withMessage('Invalid institution type'),

  // Common validations
  body('product.name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be 2-100 characters'),

  body('product.status')
    .optional()
    .isIn(['ready to harvest', 'harvested'])
    .withMessage('Invalid product status'),

  body('quantity.amount')
    .isNumeric().withMessage('Quantity amount must be a number')
    .isFloat({ gt: 0 }).withMessage('Quantity amount must be greater than 0'),

  body('quantity.unit')
    .isIn(['kg', 'tons', 'bundles', 'crates', 'liters', 'heads', 'tray'])
    .withMessage('Invalid quantity unit'),

  body('pricePerUnit')
    .isFloat({ gt: 0 }).withMessage('Price per unit must be greater than 0'),

  body('location.county')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('County must be 2-50 characters'),

  body('location.subCounty')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Sub-county must be 2-50 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  handleValidationErrors
];

// UPDATE validator
exports.validateMarketListingUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid listing ID'),

  body('userType')
    .optional()
    .isIn(['farmer', 'buyer']).withMessage('User type must be either farmer or buyer'),

  // Farmer-specific validations for updates
  body('farmId')
    .if(body('userType').equals('farmer'))
    .optional()
    .custom(value => isValidObjectId(value))
    .withMessage('Invalid farm ID'),

  // Buyer-specific validations for updates
  body('institutionName')
    .if(body('userType').equals('buyer'))
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Institution name must be 2-100 characters'),

  body('institutionType')
    .if(body('userType').equals('buyer'))
    .optional()
    .isIn(['school', 'restaurant', 'hotel', 'supermarket', 'exporter', 'individual'])
    .withMessage('Invalid institution type'),

  body('status')
    .optional()
    .isIn(['available', 'reserved', 'sold', 'supplied', 'expired'])
    .withMessage('Invalid status value'),

  body('pricePerUnit')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price per unit must be greater than 0'),

  body('product.name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be 2-100 characters'),

  body('quantity.amount')
    .optional()
    .isNumeric().withMessage('Quantity amount must be a number')
    .isFloat({ gt: 0 }).withMessage('Quantity amount must be greater than 0'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  handleValidationErrors
];

// DELETE validator
exports.validateMarketListingDelete = [
  param('id')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  handleValidationErrors
];

// Export handler
exports.handleValidationErrors = handleValidationErrors;
