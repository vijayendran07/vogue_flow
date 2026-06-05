const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const cloudinary = require('cloudinary').v2;

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
    const { code, discountPercentage, expireAt, bgImage } = req.body;

    const couponData = {
        code,
        discountPercentage,
        expireAt,
    };

    if (bgImage) {
        const result = await cloudinary.uploader.upload(bgImage, {
            folder: 'vagueflow/coupons',
        });
        couponData.bgImage = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    const coupon = await Coupon.create(couponData);

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

exports.getActiveCoupons = catchAsyncErrors(async (req, res, next) => {
    const coupons = await Coupon.find({
        isActive: true,
        expireAt: { $gt: Date.now() },
    }).sort({ expireAt: 1 });

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

    // Delete image from Cloudinary
    if (coupon.bgImage && coupon.bgImage.public_id) {
        await cloudinary.uploader.destroy(coupon.bgImage.public_id);
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

    // Support full updates if request body is provided
    if (req.body.code !== undefined) coupon.code = req.body.code.toUpperCase();
    if (req.body.discountPercentage !== undefined) coupon.discountPercentage = Number(req.body.discountPercentage);
    if (req.body.expireAt !== undefined) coupon.expireAt = req.body.expireAt;
    
    if (req.body.bgImage !== undefined) {
        const { bgImage } = req.body;
        if (bgImage && typeof bgImage === 'string' && bgImage.startsWith('data:image')) {
            // Delete old image from Cloudinary
            if (coupon.bgImage && coupon.bgImage.public_id) {
                await cloudinary.uploader.destroy(coupon.bgImage.public_id);
            }

            const result = await cloudinary.uploader.upload(bgImage, {
                folder: 'vagueflow/coupons',
            });

            coupon.bgImage = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        } else if (!bgImage) {
            // Clear image if requested
            if (coupon.bgImage && coupon.bgImage.public_id) {
                await cloudinary.uploader.destroy(coupon.bgImage.public_id);
            }
            coupon.bgImage = undefined;
        }
    }

    // Toggle active state only if not explicitly updating other values, or if explicitly passed
    if (req.body.isActive !== undefined) {
        coupon.isActive = req.body.isActive;
    } else if (req.body.code === undefined && req.body.discountPercentage === undefined && req.body.expireAt === undefined && req.body.bgImage === undefined) {
        coupon.isActive = !coupon.isActive;
    }

    await coupon.save();

    res.status(200).json({
        success: true,
        coupon,
    });
});
