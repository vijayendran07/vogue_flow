const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment, sendRazorpayKeyId } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/payment/razorpay/order').post(isAuthenticatedUser, createRazorpayOrder);
router.route('/payment/razorpay/verify').post(isAuthenticatedUser, verifyRazorpayPayment);
router.route('/razorpaykey').get(isAuthenticatedUser, sendRazorpayKeyId);

module.exports = router;
