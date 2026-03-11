const { body, validationResult } = require('express-validator');

// Registration validation rules
const validateRegistration = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),

    body('qualification')
        .trim()
        .notEmpty().withMessage('Course Applied is required'),

    body('state')
        .trim()
        .notEmpty().withMessage('State is required'),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required'),

    body('consent')
        .notEmpty().withMessage('Consent is required')
        .isBoolean().withMessage('Consent must be a boolean')
        .custom(value => value === true).withMessage('You must provide consent to proceed')
];

// Answer save validation
const validateAnswer = [
    body('sessionId')
        .notEmpty().withMessage('Session ID is required')
        .isMongoId().withMessage('Invalid session ID'),

    body('questionId')
        .notEmpty().withMessage('Question ID is required')
        .isMongoId().withMessage('Invalid question ID'),

    body('selectedOption')
        .optional()
        .isIn(['A', 'B', 'C', 'D']).withMessage('Selected option must be A, B, C, or D')
];

// Submit validation
const validateSubmit = [
    body('sessionId')
        .notEmpty().withMessage('Session ID is required')
        .isMongoId().withMessage('Invalid session ID')
];

// Admin login validation
const validateAdminLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Middleware to check validation results
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join(', '),
            errors: errors.array()
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateAnswer,
    validateSubmit,
    validateAdminLogin,
    checkValidation
};
