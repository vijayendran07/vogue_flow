const express = require('express');
const {
    createBanner,
    getAllBanners,
    getAdminBanners,
    updateBanner,
    deleteBanner
} = require('../controllers/bannerController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/banners').get(getAllBanners);

// Admin Routes
router
    .route('/admin/banners')
    .get(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), getAdminBanners);

router
    .route('/admin/banner/new')
    .post(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), createBanner);

router
    .route('/admin/banner/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), updateBanner)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'super-admin'), deleteBanner);

module.exports = router;
