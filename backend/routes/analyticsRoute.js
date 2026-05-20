const express = require('express');
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/admin/analytics').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminAnalytics);

module.exports = router;
