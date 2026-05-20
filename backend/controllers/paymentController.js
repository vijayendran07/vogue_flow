const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const ErrorHandler = require('../utils/errorhander');

// Create Razorpay Order
exports.createRazorpayOrder = catchAsyncErrors(async (req, res, next) => {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
    });

    const { 
        shippingInfo, 
        billingInfo, 
        orderItems, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;

    // Create a pending order in MongoDB
    const order = await Order.create({
        shippingInfo,
        billingInfo: billingInfo || shippingInfo,
        orderItems,
        paymentMethod: 'Online Payment (Razorpay)',
        paymentStatus: 'Pending',
        paymentInfo: {
            id: 'pending_razorpay_id',
            status: 'Pending',
            method: 'Razorpay'
        },
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        user: req.user._id,
        orderStatus: 'Pending'
    });

    // Create Razorpay Order options
    const options = {
        amount: Math.round(totalPrice * 100), // convert to paise
        currency: "INR",
        receipt: order._id.toString()
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);
        
        // Update order with Razorpay Order ID
        order.paymentInfo.id = razorpayOrder.id;
        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order._id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id'
        });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        return next(new ErrorHandler("Razorpay order creation failed", 500));
    }
});

// Verify Razorpay Signature
exports.verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';

    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new ErrorHandler("Order not found", 404));
        }

        order.paymentStatus = 'Paid';
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentInfo.status = 'succeeded';
        order.paymentInfo.id = razorpay_payment_id;
        order.orderStatus = 'Confirmed';
        order.timeline.push({
            status: 'Confirmed',
            message: 'Payment verified successfully via Razorpay Signature',
            timestamp: new Date(),
            updatedBy: 'system'
        });

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } else {
        return next(new ErrorHandler("Payment verification failed. Invalid signature.", 400));
    }
});

exports.sendRazorpayKeyId = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id' });
});
