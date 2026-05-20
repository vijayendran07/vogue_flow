const express = require('express');
const {
    updateCart,
    getCart,
    applyCoupon,
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    toggleCouponActive,
} = require('../controllers/cartController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/cart/update').put(isAuthenticatedUser, updateCart);
router.route('/cart').get(isAuthenticatedUser, getCart);
router.route('/coupon/apply').post(applyCoupon);

// Admin
router.route('/admin/coupon/new').post(isAuthenticatedUser, authorizeRoles('admin'), createCoupon);
router.route('/admin/coupons').get(isAuthenticatedUser, authorizeRoles('admin'), getAllCoupons);
router.route('/admin/coupon/:id')
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCoupon)
    .put(isAuthenticatedUser, authorizeRoles('admin'), toggleCouponActive);

module.exports = router;
