const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const setupSecurityMiddleware = (app) => {
    // 1. Set security HTTP headers
    app.use(helmet());

    // 2. Rate limiting (Allow higher limit in development to prevent lockouts)
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Limit each IP to 100 in prod, 10000 in dev
        message: 'Too many requests from this IP, please try again in 15 minutes',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    app.use('/api', limiter);

    // 3. Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // 4. Data sanitization against XSS
    app.use(xss());

    // 5. Prevent HTTP Parameter Pollution
    // Whitelist can be added if certain parameters are allowed to be duplicated
    app.use(hpp({
        whitelist: [
            'price',
            'category',
            'ratings',
            // Add other parameters that might legitimately be arrays in query strings
        ]
    }));
};

module.exports = setupSecurityMiddleware;
