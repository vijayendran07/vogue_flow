const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const connectCloudinary = require('./config/cloudinary');

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// Config
dotenv.config();

// Validate production configuration
const validateProductionConfig = require('./config/production');
validateProductionConfig();

// Connecting to database
connectDatabase();

// Connect to Cloudinary
connectCloudinary();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is working on http://localhost:${PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});
