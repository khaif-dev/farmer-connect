const { body, param, validationResult } = require('express-validator');

// Reusable error handler
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

// CREATE validation
exports.validateBuyerOfferCreate = [
  body('buyerId').notEmpty().withMessage('Buyer ID is required'),
  body('buyerType')
    .notEmpty().withMessage('Buyer type is required')
    .isIn(['school', 'restaurant', 'hotel', 'supermarket', 'exporter'])
    .withMessage('Invalid buyer type'),
  body('product').notEmpty().withMessage('Product is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit')
    .notEmpty()
    .isIn(['kg', 'tons', 'bundles', 'crates', 'liters', 'tray', 'head'])
    .withMessage('Invalid quantity unit'),
  body('maxPricePerUnit')
    .isFloat({ gt: 0 })
    .withMessage('Max price per unit must be greater than 0'),
  body('deliveryLocation.name').notEmpty().withMessage('Delivery location name is required'),
  body('deliveryLocation.county').notEmpty().withMessage('Delivery county is required'),
  body('deliveryLocation.coordinates.lat')
    .isFloat().withMessage('Latitude must be a number'),
  body('deliveryLocation.coordinates.lng')
    .isFloat().withMessage('Longitude must be a number'),
  body('deliveryDate').notEmpty().withMessage('Delivery date is required'),
  body('frequency')
    .isIn(['once', 'daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency value'),
  handleValidationErrors
];

// UPDATE validation
exports.validateBuyerOfferUpdate = [
  param('id').isMongoId().withMessage('Invalid offer ID'),
  body('status')
    .optional()
    .isIn(['active', 'fulfilled', 'cancelled'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// DELETE validation
exports.validateBuyerOfferDelete = [
  param('id').isMongoId().withMessage('Invalid offer ID'),
  handleValidationErrors
];
