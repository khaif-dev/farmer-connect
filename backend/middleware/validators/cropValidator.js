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
exports.validateCropCreate = [
  body('farmId').notEmpty().withMessage('Farm ID is required'),
  body('type').notEmpty().withMessage('Crop type is required'),
  body('area').optional().isNumeric().withMessage('Area must be a number'),
  body('status')
    .optional()
    .isIn(['planted', 'growing', 'ready', 'harvested'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// UPDATE validation
exports.validateCropUpdate = [
  param('id').isMongoId().withMessage('Invalid crop ID'),
  body('status')
    .optional()
    .isIn(['planted', 'growing', 'ready', 'harvested'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// DELETE validation
exports.validateCropDelete = [
  param('id').isMongoId().withMessage('Invalid crop ID'),
  handleValidationErrors
];
