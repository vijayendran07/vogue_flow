const Banner = require('../models/bannerModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const cloudinary = require('cloudinary').v2;

// Create New Banner (Admin)
exports.createBanner = catchAsyncErrors(async (req, res, next) => {
    const { title, subtitle, tag, brands, bgImage, active } = req.body;

    if (!bgImage) {
        return next(new ErrorHandler('Please upload a banner background image', 400));
    }

    const result = await cloudinary.uploader.upload(bgImage, {
        folder: 'vagueflow/banners',
    });

    const banner = await Banner.create({
        title,
        subtitle,
        tag,
        brands,
        bgImage: {
            public_id: result.public_id,
            url: result.secure_url,
        },
        active: active !== undefined ? active : true,
    });

    res.status(201).json({
        success: true,
        banner,
    });
});

// Get All Active Banners (Public)
exports.getAllBanners = catchAsyncErrors(async (req, res, next) => {
    const banners = await Banner.find({ active: true }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        banners,
    });
});

// Get All Banners (Admin)
exports.getAdminBanners = catchAsyncErrors(async (req, res, next) => {
    const banners = await Banner.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        banners,
    });
});

// Update Banner (Admin)
exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
        return next(new ErrorHandler('Banner not found', 404));
    }

    const { title, subtitle, tag, brands, bgImage, active } = req.body;

    const bannerData = {
        title,
        subtitle,
        tag,
        brands,
        active: active !== undefined ? active : banner.active,
    };

    if (bgImage && typeof bgImage === 'string' && bgImage.startsWith('data:image')) {
        // Delete old image from Cloudinary
        if (banner.bgImage && banner.bgImage.public_id) {
            await cloudinary.uploader.destroy(banner.bgImage.public_id);
        }

        const result = await cloudinary.uploader.upload(bgImage, {
            folder: 'vagueflow/banners',
        });

        bannerData.bgImage = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, bannerData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        banner,
    });
});

// Delete Banner (Admin)
exports.deleteBanner = catchAsyncErrors(async (req, res, next) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        return next(new ErrorHandler('Banner not found', 404));
    }

    // Delete image from Cloudinary
    if (banner.bgImage && banner.bgImage.public_id) {
        await cloudinary.uploader.destroy(banner.bgImage.public_id);
    }

    await banner.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Banner Deleted Successfully',
    });
});
