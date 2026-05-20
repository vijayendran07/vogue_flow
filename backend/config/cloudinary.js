const cloudinary = require('cloudinary').v2;

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME || 'placeholder_name',
        api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_api',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_secret'
    });
};

module.exports = connectCloudinary;
