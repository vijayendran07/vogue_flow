const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

exports.updateCart = catchAsyncErrors(async (req, res, next) => {
    const { cartItems } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            cartItems: cartItems || [],
        });
    } else {
        cart.cartItems = cartItems;
        await cart.save();
    }

    res.status(200).json({
        success: true,
        cart,
    });
});

exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    res.status(200).json({
        success: true,
        cart: cart || { cartItems: [] },
    });
});

exports.applyCoupon = catchAsyncErrors(async (req, res, next) => {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expireAt: { $gt: Date.now() },
    });

    if (!coupon) {
        return next(new ErrorHandler('Invalid or expired coupon code', 400));
    }

    res.status(200).json({
        success: true,
        discountPercentage: coupon.discountPercentage,
        couponCode: coupon.code,
    });
});

exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
    const { code, discountPercentage, expireAt } = req.body;

    const coupon = await Coupon.create({
        code,
        discountPercentage,
        expireAt,
    });

    res.status(201).json({
        success: true,
        coupon,
    });
});

exports.getAllCoupons = catchAsyncErrors(async (req, res, next) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        coupons,
    });
});

exports.deleteCoupon = catchAsyncErrors(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        return next(new ErrorHandler('Coupon not found', 404));
    }

    await coupon.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
    });
});

exports.toggleCouponActive = catchAsyncErrors(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        return next(new ErrorHandler('Coupon not found', 404));
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
        success: true,
        coupon,
    });
});
