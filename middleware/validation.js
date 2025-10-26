const { body, validationResult } = require('express-validator');
const { isValidCountry, isValidStateAbbreviation } = require('../utils/countries');

exports.validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['traveler', 'owner']).withMessage('Role must be traveler or owner')
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.validateProfileUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  body('country').optional().custom((value) => {
    if (value && !isValidCountry(value)) {
      throw new Error('Invalid country');
    }
    return true;
  }),
  body('state').optional().custom((value) => {
    if (value && value.length === 2 && !isValidStateAbbreviation(value)) {
      throw new Error('Invalid state abbreviation. Use 2-letter state code (e.g., CA, NY, ON)');
    }
    return true;
  }),
  body('gender').optional().isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Invalid gender option')
];

exports.validatePropertyCreate = [
  body('name').trim().notEmpty().withMessage('Property name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('price_per_night').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('max_guests').optional().isInt({ min: 1 }).withMessage('Max guests must be at least 1')
];

exports.validateBooking = [
  body('property_id').isInt({ min: 1 }).withMessage('Valid property ID is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required'),
  body('guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
  body('end_date').custom((endDate, { req }) => {
    const start = new Date(req.body.start_date);
    const end = new Date(endDate);
    if (end <= start) {
      throw new Error('End date must be after start date');
    }
    if (start < new Date()) {
      throw new Error('Start date cannot be in the past');
    }
    return true;
  })
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};