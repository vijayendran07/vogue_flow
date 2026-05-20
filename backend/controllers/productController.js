const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');
const cloudinary = require('cloudinary').v2;

// Self-healing: Resolve category name/slug to Mongoose ObjectId if possible
const resolveCategoryQuery = async (query) => {
    if (query && query.category) {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(query.category);
        if (!isValidObjectId) {
            // Find by name (case-insensitive)
            const categoryObj = await Category.findOne({
                name: { $regex: new RegExp("^" + query.category + "$", "i") }
            });
            if (categoryObj) {
                query.category = categoryObj._id;
            } else {
                // If not found, use a non-existent ObjectId to return no products cleanly instead of throwing Mongoose CastError
                query.category = new mongoose.Types.ObjectId();
            }
        }
    }
};

const generateSlug = (text) => {
    const slug = text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return `${slug}-${Date.now().toString().slice(-5)}`;
};

const uploadImages = async (images) => {
    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (typeof image === 'object' && image.url) {
            imagesLinks.push(image);
            continue;
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: 'vagueflow/products',
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    return imagesLinks;
};

const deleteCloudinaryImages = async (images = []) => {
    for (let i = 0; i < images.length; i++) {
        if (images[i]?.public_id) {
            await cloudinary.uploader.destroy(images[i].public_id);
        }
    }
};

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
    }

    const imagesLinks = await uploadImages(images);

    req.body.images = imagesLinks;
    req.body.user = req.user.id;
    req.body.slug = generateSlug(req.body.name);
    req.body.deleted = false;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    });
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 20;
    const productsCount = await Product.countDocuments({ deleted: false });

    await resolveCategoryQuery(req.query);

    const apiFeature = new ApiFeatures(Product.find({ deleted: false }).populate('category', 'name'), req.query)
        .search()
        .filter()
        .sort();

    let products = await apiFeature.query;
    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone().lean();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = Number(req.query.limit) || 12;
    const productsCount = await Product.countDocuments({ deleted: false });

    await resolveCategoryQuery(req.query);

    const apiFeature = new ApiFeatures(Product.find({ deleted: false }).populate('category', 'name'), req.query)
        .search()
        .filter()
        .sort();

    let products = await apiFeature.query;
    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);
    products = await apiFeature.query.clone().lean();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        filteredProductsCount,
        resultPerPage,
    });
});

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findOne({ _id: req.params.id, deleted: false }).populate('category', 'name');

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findOne({ _id: req.params.id, deleted: false });

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    if (req.body.name && req.body.name !== product.name) {
        req.body.slug = generateSlug(req.body.name);
    }

    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
    }

    if (images !== undefined) {
        if (images.length === 0) {
            await deleteCloudinaryImages(product.images);
            req.body.images = [];
        } else {
            if (images.every((img) => typeof img === 'string')) {
                await deleteCloudinaryImages(product.images);
            }
            req.body.images = await uploadImages(images);
        }
    } else {
        req.body.images = product.images;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    }).populate('category', 'name');

    res.status(200).json({
        success: true,
        product,
    });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product.deleted = true;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
    });
});

exports.duplicateProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findOne({ _id: req.params.id, deleted: false });

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const duplicateData = product.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.slug = generateSlug(`${duplicateData.name}-copy`);
    duplicateData.deleted = false;

    const duplicatedProduct = await Product.create(duplicateData);

    res.status(201).json({
        success: true,
        product: duplicatedProduct,
    });
});

exports.bulkDeleteProducts = catchAsyncErrors(async (req, res, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler('Please provide product IDs to delete', 400));
    }

    await Product.updateMany({ _id: { $in: ids }, deleted: false }, { deleted: true });

    res.status(200).json({
        success: true,
        deletedCount: ids.length,
    });
});

exports.bulkUpdateProductStatus = catchAsyncErrors(async (req, res, next) => {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler('Please provide product IDs', 400));
    }

    const allowedStatuses = ['Active', 'Draft', 'Hidden'];
    if (!allowedStatuses.includes(status)) {
        return next(new ErrorHandler('Invalid status value', 400));
    }

    await Product.updateMany({ _id: { $in: ids }, deleted: false }, { status });

    res.status(200).json({
        success: true,
        updatedCount: ids.length,
    });
});

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;
    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});
