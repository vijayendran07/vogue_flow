const mongoose = require('mongoose');

const connectDatabase = () => {
    if (!process.env.MONGO_URI) {
        console.warn('MongoDB URI is missing. Skipping database connection.');
        return;
    }

    mongoose.connect(process.env.MONGO_URI)
        .then((data) => {
            console.log(`Mongodb connected with server: ${data.connection.host}`);
        })
        .catch((err) => {
            console.error(`Database connection failed: ${err.message}`);
            process.exit(1);
        });
};

module.exports = connectDatabase;
