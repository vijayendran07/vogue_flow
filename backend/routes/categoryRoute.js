const express = require('express');
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/categories').get(getAllCategories);

// Admin Routes
router
    .route('/admin/category/new')
    .post(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), createCategory);

router
    .route('/admin/category/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), updateCategory)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), deleteCategory);

module.exports = router;
