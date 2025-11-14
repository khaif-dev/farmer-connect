const {body, validationResult} = require ('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// Validate new user
exports.validateUserRegistration = [
    body('firstName')
    .trim()
    .isString().withMessage('First name must be a string')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

    body('lastName')
    .trim()
    .isString().withMessage('Last name must be a string')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

    body('email')
    .trim()
    .optional()
    .isEmail().withMessage('Please provide a valid email address'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('en-KE').withMessage('Please enter a valid Kenyan phone number'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .isLength({ max: 12 }).withMessage('Password cannot exceed 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&.]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, .)'),

    body('userType')
    .optional()
    .isIn(['farmer', 'buyer', 'admin'])
    .withMessage('Invalid user type'),

    body('profile.username')
    .trim()
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Username must be between 2 and 10 characters'),

    body('location.county')
    .optional()
    .isString().withMessage('County must be a string'),

    body('location.subCounty')
    .optional()
    .isString().withMessage('Sub-county must be a string'),

    body('subscription.plan')
    .optional()
    .isIn(['free', 'premium'])
    .withMessage('Subscription plan must be either free or premium'),

    handleValidationErrors
];

// Validate user login
exports.validateUserLogin = [
    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('en-KE').withMessage('Please enter a valid Kenyan phone number'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

// Validate user profile update
exports.validateUserUpdate = [
    body('email').trim().optional().isEmail().withMessage('Please provide a valid email address'),
    body('firstName').trim().optional().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().optional().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('phone').trim().optional().custom((value) => {
      if (!value) return true;
      // More flexible phone validation for updates
      return /^(\+254|0)[17]\d{8}$/.test(value.replace(/\s/g, ''));
    }).withMessage('Please enter a valid Kenyan phone number'),

    body('password')
    .trim()
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&.]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, .)'),

    body('confirmPassword')
    .trim()
    .optional()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
        throw new Error('Passwords do not match');
        }
        return true;
    }),
   
    body('profile.username').optional().isLength({ min: 2 }).withMessage('Username too short'),
    body('location.county').optional().isString(),
    body('location.subCounty').optional().isString(),
    
    body('buyerDetails.institutionType')
    .optional()
    .isIn(['school', 'restaurant', 'hotel', 'supermarket', 'exporter', 'individual'])
    .withMessage('Invalid institution type'),
    
    body('buyerDetails.purchaseInterests')
    .optional()
    .isArray()
    .withMessage('Purchase interests must be an array'),

    handleValidationErrors
];

// Validate user delete
exports.validateUserDelete = [
    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('en-KE').withMessage('Please enter a valid Kenyan phone number'),

    body('password')
    .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

// Validate password reset
exports.validatePasswordReset = [
    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('en-KE').withMessage('Please enter a valid Kenyan phone number'),

    body('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .isLength({ max: 12 }).withMessage('Password cannot exceed 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&.]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, .)'),

    body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
        }
        return true;
    }),

    handleValidationErrors
];




