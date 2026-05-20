const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const errorMiddleware = require('./middleware/error');
const setupSecurityMiddleware = require('./middleware/security');

// Trust proxy if we are behind a reverse proxy (e.g., Heroku, Nginx)
app.set('trust proxy', 1);

// Compress all responses
app.use(compression());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5180'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Apply Security Middlewares
setupSecurityMiddleware(app);

// Route Imports
const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const category = require('./routes/categoryRoute');
const cart = require('./routes/cartRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const analytics = require('./routes/analyticsRoute');
const banner = require('./routes/bannerRoute');

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', category);
app.use('/api/v1', cart);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', analytics);
app.use('/api/v1', banner);

app.get('/', (req, res) => {
    res.send('NovaCart API is running...');
});

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
