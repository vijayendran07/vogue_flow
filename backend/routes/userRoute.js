const express = require('express');
const {
    registerUser,
    loginUser,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    syncWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getAllUsers,
    getSingleUser,
    updateUser,
    toggleUserBlock,
    updateUserRole,
    deleteUser,
    addUserNote,
    getUserActivityLogs,
    getUserAnalytics,
    bulkUpdateUsers,
    exportUsers,
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/auth/google').post(googleLogin);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').get(logout);

// Authenticated User Routes
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

// Wishlist Routes
router.route('/wishlist/sync').post(isAuthenticatedUser, syncWishlist);
router.route('/wishlist/add').post(isAuthenticatedUser, addToWishlist);
router.route('/wishlist/remove/:productId').delete(isAuthenticatedUser, removeFromWishlist);
router.route('/wishlist/clear').delete(isAuthenticatedUser, clearWishlist);

// Admin Routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getAllUsers);
router.route('/admin/users/analytics').get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getUserAnalytics);
router.route('/admin/users/export').get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), exportUsers);
router.route('/admin/users/bulk-update').put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), bulkUpdateUsers);

router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), deleteUser);

router.route('/admin/user/:id/block').put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), toggleUserBlock);
router.route('/admin/user/:id/role').put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), updateUserRole);
router.route('/admin/user/:id/note').post(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), addUserNote);
router.route('/admin/user/:id/activity-logs').get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getUserActivityLogs);

module.exports = router;
