const express = require('express');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrderStatus,
    updateShipping,
    deleteOrder,
    cancelOrder,
    generateInvoice,
    bulkUpdateOrders,
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/order/:id/cancel').put(isAuthenticatedUser, cancelOrder);
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// Admin order management
router.route('/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.route('/orders/bulk').put(isAuthenticatedUser, authorizeRoles('admin'), bulkUpdateOrders);
router.route('/orders/:id/status').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.route('/orders/:id/shipping').put(isAuthenticatedUser, authorizeRoles('admin'), updateShipping);
router.route('/orders/:id/invoice').post(isAuthenticatedUser, authorizeRoles('admin'), generateInvoice);
router.route('/orders/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

// compatibility routes
router
    .route('/admin/orders')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router
    .route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
