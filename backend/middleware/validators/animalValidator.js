const { body, param, validationResult } = require('express-validator');

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
exports.validateAnimalCreate = [
  body('farmId').notEmpty().withMessage('Farm ID is required'),
  body('type').notEmpty().withMessage('Animal type is required'),
  body('number')
    .optional()
    .isNumeric()
    .withMessage('Number of animals must be numeric'),
  body('ageGroup')
    .optional()
    .isIn(['Young', 'Adult', 'Mature'])
    .withMessage('Invalid age group'),
  handleValidationErrors
];

// UPDATE validation
exports.validateAnimalUpdate = [
  param('id').isMongoId().withMessage('Invalid animal ID'),
  body('ageGroup')
    .optional()
    .isIn(['Young', 'Adult', 'Mature'])
    .withMessage('Invalid age group'),
  handleValidationErrors
];

// DELETE validation
exports.validateAnimalDelete = [
  param('id').isMongoId().withMessage('Invalid animal ID'),
  handleValidationErrors
];
