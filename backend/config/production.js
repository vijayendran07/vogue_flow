/**
 * Validates that all required environment variables are present before starting
 * the server in a production environment.
 */
const validateProductionConfig = () => {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    const requiredEnvVars = [
        'MONGO_URI',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'JWT_SECRET',
        'JWT_EXPIRE',
        'COOKIE_EXPIRE',
        'CLOUDINARY_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        console.error('CRITICAL ERROR: Missing required environment variables for production:');
        missingEnvVars.forEach((envVar) => console.error(`- ${envVar}`));
        console.error('Server is shutting down because of incomplete configuration.');
        process.exit(1);
    }

    console.log('Production configuration validated successfully.');
};

module.exports = validateProductionConfig;
