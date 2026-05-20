const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const cloudinary = require('cloudinary').v2;

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description, parentCategory, image } = req.body;

    const categoryData = { name, description };
    if (parentCategory) {
        categoryData.parentCategory = parentCategory;
    }

    if (image) {
        const result = await cloudinary.uploader.upload(image, {
            folder: 'vagueflow/categories',
        });
        categoryData.image = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
        success: true,
        category,
    });
});

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find().populate('parentCategory', 'name').lean();

    res.status(200).json({
        success: true,
        categories,
    });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    if (req.body.image) {
        if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
            if (category.image && category.image.public_id) {
                await cloudinary.uploader.destroy(category.image.public_id);
            }
            const result = await cloudinary.uploader.upload(req.body.image, {
                folder: 'vagueflow/categories',
            });
            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        category,
    });
});

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    const productsAttached = await Product.findOne({ category: categoryId });
    if (productsAttached) {
        return next(new ErrorHandler('Cannot delete category. Products are associated with it.', 400));
    }

    const subCategories = await Category.findOne({ parentCategory: categoryId });
    if (subCategories) {
        return next(new ErrorHandler('Cannot delete category. Subcategories exist.', 400));
    }

    if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Category Deleted Successfully',
    });
});
