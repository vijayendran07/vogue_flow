const { validationResult } = require('express-validator');
const ErrorHandler = require('../utils/errorhander');

/**
 * Middleware to process express-validator rules and return errors.
 * Usage:
 * router.post('/route', [
 *     body('email').isEmail().withMessage('Enter valid email'),
 *     validationMiddleware
 * ], controllerFn)
 */
const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return next(new ErrorHandler(errorMessages, 400));
    }
    
    next();
};

module.exports = validationMiddleware;
