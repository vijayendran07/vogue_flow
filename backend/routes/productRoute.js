const express = require('express');
const { body } = require('express-validator');
const {
    getAllProducts,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteReview,
    duplicateProduct,
    bulkDeleteProducts,
    bulkUpdateProductStatus,
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

const productValidationRules = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Product description is required'),
    body('category').notEmpty().withMessage('Product category is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('discountPrice').optional().isFloat({ min: 0 }).withMessage('Discount price must be non-negative'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('status').optional().isIn(['Active', 'Draft', 'Hidden']).withMessage('Invalid product status'),
    body('variants').optional().isArray().withMessage('Variants must be an array'),
    body('variants.*.stock').optional().isInt({ min: 0 }).withMessage('Variant stock must be a non-negative integer'),
    body('variants.*.priceDifference').optional().isFloat({ min: 0 }).withMessage('Variant price difference must be non-negative'),
    validationMiddleware,
];

router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getProductDetails);

// Admin Routes
router
    .route('/admin/products')
    .get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getAdminProducts);

router
    .route('/admin/product/new')
    .post(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), productValidationRules, createProduct);

router
    .route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), productValidationRules, updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), deleteProduct);

router
    .route('/admin/product/duplicate/:id')
    .post(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), duplicateProduct);

router
    .route('/admin/products/bulk-delete')
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), bulkDeleteProducts);

router
    .route('/admin/products/bulk-status')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), [
        body('status').isIn(['Active', 'Draft', 'Hidden']).withMessage('Invalid status'),
        validationMiddleware,
    ], bulkUpdateProductStatus);

// Reviews
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews')
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
