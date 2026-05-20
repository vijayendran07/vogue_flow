const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        phone,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl",
        },
    });

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email & Password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged Out',
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `NovaCart Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler('Reset Password Token is invalid or has been expired', 400)
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Old Password is incorrect', 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
    };

    if (req.body.address) {
        newUserData.addresses = [{
            type: 'shipping',
            address: req.body.address,
            city: req.body.city || 'N/A',
            state: req.body.state || 'N/A',
            country: req.body.country || 'N/A',
            pinCode: req.body.pinCode || 'N/A',
            phoneNo: req.body.phone || 'N/A',
            isDefault: true
        }];
    }

    const cloudinary = require('cloudinary');

    if (req.body.avatar) {
        const currentUser = await User.findById(req.user.id);
        if (currentUser.avatar && currentUser.avatar.public_id && currentUser.avatar.public_id !== "this is a sample id" && currentUser.avatar.public_id !== "profilepicUrl") {
            try {
                await cloudinary.v2.uploader.destroy(currentUser.avatar.public_id);
            } catch (err) {
                console.log("Failed to destroy old avatar", err);
            }
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'vagueflow/avatars',
            width: 150,
            crop: 'scale',
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

// Sync Wishlist
exports.syncWishlist = catchAsyncErrors(async (req, res, next) => {
    const { wishlistItems } = req.body;
    const user = await User.findById(req.user.id);

    if (wishlistItems && wishlistItems.length > 0) {
        wishlistItems.forEach(id => {
            if (!user.wishlist.includes(id)) {
                user.wishlist.push(id);
            }
        });
        await user.save({ validateBeforeSave: false });
    }

    const populatedUser = await User.findById(req.user.id).populate('wishlist', 'name price discountPrice images stock ratings numOfReviews category');

    res.status(200).json({
        success: true,
        wishlist: populatedUser.wishlist,
    });
});

// Add to Wishlist
exports.addToWishlist = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        success: true,
        message: 'Product added to wishlist'
    });
});

// Remove from Wishlist
exports.removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist'
    });
});

// Clear Wishlist
exports.clearWishlist = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    user.wishlist = [];
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully',
        wishlist: [],
    });
});

const ApiFeatures = require('../utils/apifeatures');

// Admin: Get all users with advanced filtering and analytics
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;

    // Build query
    let query = { isDeleted: { $ne: true } };

    // Search functionality
    if (req.query.keyword) {
        query.$or = [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
            { phone: { $regex: req.query.keyword, $options: 'i' } }
        ];
    }

    // Filters
    if (req.query.role && req.query.role !== 'all') {
        query.role = req.query.role;
    }

    if (req.query.status) {
        if (req.query.status === 'blocked') {
            query.isBlocked = true;
        } else if (req.query.status === 'active') {
            query.isBlocked = false;
        }
    }

    if (req.query.verified) {
        query.emailVerified = req.query.verified === 'true';
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) {
            query.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            query.createdAt.$lte = new Date(req.query.endDate);
        }
    }

    // Sorting
    let sortOptions = {};
    switch (req.query.sort) {
        case 'newest':
            sortOptions = { createdAt: -1 };
            break;
        case 'oldest':
            sortOptions = { createdAt: 1 };
            break;
        case 'highest-spending':
            sortOptions = { totalSpent: -1 };
            break;
        case 'most-orders':
            sortOptions = { totalOrders: -1 };
            break;
        case 'last-login':
            sortOptions = { lastLogin: -1 };
            break;
        default:
            sortOptions = { createdAt: -1 };
    }

    const usersCount = await User.countDocuments(query);
    const users = await User.find(query)
        .sort(sortOptions)
        .limit(resultPerPage)
        .skip((page - 1) * resultPerPage)
        .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpires');

    // Analytics data
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const activeUsers = await User.countDocuments({ isBlocked: false, isDeleted: { $ne: true } });
    const blockedUsers = await User.countDocuments({ isBlocked: true, isDeleted: { $ne: true } });
    const verifiedUsers = await User.countDocuments({ emailVerified: true, isDeleted: { $ne: true } });

    // Monthly registrations for the last 12 months
    const monthlyRegistrations = await User.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);

    res.status(200).json({
        success: true,
        users,
        usersCount,
        resultPerPage,
        currentPage: page,
        totalPages: Math.ceil(usersCount / resultPerPage),
        analytics: {
            totalUsers,
            activeUsers,
            blockedUsers,
            verifiedUsers,
            monthlyRegistrations
        }
    });
});

// Admin: Get single user with full details
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate('orderHistory.orderId', 'totalPrice status createdAt')
        .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpires');

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    // Get user's order statistics
    const orderStats = await User.aggregate([
        { $match: { _id: user._id } },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'user',
                as: 'orders'
            }
        },
        {
            $project: {
                totalOrders: { $size: '$orders' },
                totalSpent: { $sum: '$orders.totalPrice' },
                lastOrderDate: { $max: '$orders.createdAt' }
            }
        }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

    res.status(200).json({
        success: true,
        user: {
            ...user.toObject(),
            stats
        }
    });
});

// Admin: Update user profile
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    const updateData = {};
    const allowedFields = ['name', 'email', 'phone', 'gender', 'dateOfBirth'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    // Log activity
    user.logActivity('profile-updated', `Profile updated by admin: ${req.user.name}`, req.ip, req.get('User-Agent'));

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
    });
});

// Admin: Block/Unblock user
exports.toggleUserBlock = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    // Prevent blocking super admin
    if (user.role === 'super-admin') {
        return next(new ErrorHandler('Cannot block super admin', 403));
    }

    const action = req.body.block ? 'block' : 'unblock';
    user.isBlocked = req.body.block;
    user.blockReason = req.body.blockReason || null;
    user.blockedAt = req.body.block ? new Date() : null;
    user.blockedBy = req.body.block ? req.user._id : null;

    // Log activity
    user.logActivity(
        action,
        `${action}ed by admin: ${req.user.name}. Reason: ${req.body.blockReason || 'N/A'}`,
        req.ip,
        req.get('User-Agent')
    );

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: `User ${action}ed successfully`,
        user
    });
});

// Admin: Update user role
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    // Role hierarchy check
    const roleHierarchy = { 'user': 1, 'manager': 2, 'admin': 3, 'super-admin': 4 };
    const currentUserRole = req.user.role;
    const targetRole = req.body.role;

    if (roleHierarchy[currentUserRole] <= roleHierarchy[targetRole]) {
        return next(new ErrorHandler('Insufficient permissions to assign this role', 403));
    }

    // Prevent demoting super admin
    if (user.role === 'super-admin' && targetRole !== 'super-admin') {
        return next(new ErrorHandler('Cannot change super admin role', 403));
    }

    user.role = targetRole;

    // Log activity
    user.logActivity(
        'role-changed',
        `Role changed from ${user.role} to ${targetRole} by admin: ${req.user.name}`,
        req.ip,
        req.get('User-Agent')
    );

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user
    });
});

// Admin: Soft delete user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    // Prevent deleting super admin
    if (user.role === 'super-admin') {
        return next(new ErrorHandler('Cannot delete super admin', 403));
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = req.user._id;

    // Log activity
    user.logActivity(
        'account-deleted',
        `Account soft deleted by admin: ${req.user.name}`,
        req.ip,
        req.get('User-Agent')
    );

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});

// Admin: Add user note
exports.addUserNote = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    user.notes.push({
        note: req.body.note,
        addedBy: req.user._id
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Note added successfully'
    });
});

// Admin: Get user activity logs
exports.getUserActivityLogs = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('activityLogs');

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    res.status(200).json({
        success: true,
        activityLogs: user.activityLogs
    });
});

// Admin: Get user analytics
exports.getUserAnalytics = catchAsyncErrors(async (req, res, next) => {
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const activeUsers = await User.countDocuments({ isBlocked: false, isDeleted: { $ne: true } });
    const blockedUsers = await User.countDocuments({ isBlocked: true, isDeleted: { $ne: true } });
    const verifiedUsers = await User.countDocuments({ emailVerified: true, isDeleted: { $ne: true } });

    // Monthly user registrations
    const monthlyData = await User.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
    ]);

    // Top spending users
    const topSpenders = await User.find({ isDeleted: { $ne: true } })
        .sort({ totalSpent: -1 })
        .limit(10)
        .select('name email totalSpent totalOrders');

    // Recent registrations
    const recentUsers = await User.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt avatar');

    res.status(200).json({
        success: true,
        analytics: {
            totalUsers,
            activeUsers,
            blockedUsers,
            verifiedUsers,
            monthlyData,
            topSpenders,
            recentUsers
        }
    });
});

// Admin: Bulk update users
exports.bulkUpdateUsers = catchAsyncErrors(async (req, res, next) => {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return next(new ErrorHandler('Please provide user IDs', 400));
    }

    let updateData = {};
    let message = '';

    switch (action) {
        case 'block':
            updateData = { isBlocked: true, blockedAt: new Date(), blockedBy: req.user._id };
            message = 'Users blocked successfully';
            break;
        case 'unblock':
            updateData = { isBlocked: false, blockedAt: null, blockedBy: null };
            message = 'Users unblocked successfully';
            break;
        case 'change-role':
            if (!value) return next(new ErrorHandler('Role value required', 400));
            updateData = { role: value };
            message = `Users role changed to ${value}`;
            break;
        case 'delete':
            updateData = { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id };
            message = 'Users deleted successfully';
            break;
        default:
            return next(new ErrorHandler('Invalid action', 400));
    }

    await User.updateMany(
        { _id: { $in: userIds }, role: { $ne: 'super-admin' } }, // Prevent bulk operations on super admin
        updateData
    );

    res.status(200).json({
        success: true,
        message,
        updatedCount: userIds.length
    });
});

// Admin: Export users to Excel
exports.exportUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({ isDeleted: { $ne: true } })
        .select('name email phone role isBlocked totalSpent totalOrders createdAt lastLogin')
        .sort({ createdAt: -1 });

    const exportData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        Role: user.role,
        Status: user.isBlocked ? 'Blocked' : 'Active',
        'Total Spent': user.totalSpent || 0,
        'Total Orders': user.totalOrders || 0,
        'Joined Date': user.createdAt.toLocaleDateString(),
        'Last Login': user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'
    }));

    res.status(200).json({
        success: true,
        data: exportData
    });
});

// Google OAuth 2.0 Callback login handler
exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
    const { code, state } = req.body;

    if (!code || !state) {
        return next(new ErrorHandler('Authorization code and state are required parameters', 400));
    }

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5180/auth/google/callback',
            grant_type: 'authorization_code',
        }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        return next(new ErrorHandler(tokenData.error_description || 'Failed to exchange Google OAuth code', 400));
    }

    const { access_token } = tokenData;

    // Fetch user profile info from Google API
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
        return next(new ErrorHandler('Failed to retrieve user info from Google', 400));
    }

    // Search for existing user with googleId or email
    let user = await User.findOne({
        $or: [
            { googleId: profile.sub },
            { email: profile.email.toLowerCase() }
        ]
    }).select('+password');

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (user) {
        // Link googleId if missing (case where user signed up via email first)
        if (!user.googleId) {
            user.googleId = profile.sub;
        }

        // Sync name if needed or update default avatar if not set
        if (!user.avatar || !user.avatar.url || user.avatar.url === 'profilepicUrl') {
            user.avatar = {
                public_id: 'google-auth',
                url: profile.picture
            };
        }

        if (user.isBlocked) {
            return next(new ErrorHandler(`Your account is blocked. Reason: ${user.blockReason || 'Unspecified'}`, 403));
        }

        user.updateLastLogin(ipAddress, 'OAuth Client', 'Google Gateway');
        user.logActivity('OAuth Login', 'Google OAuth 2.0 handshake verified success', ipAddress, userAgent);
        await user.save({ validateBeforeSave: false });
    } else {
        // Provision a new user for Google login
        user = await User.create({
            name: profile.name,
            email: profile.email.toLowerCase(),
            googleId: profile.sub,
            avatar: {
                public_id: 'google-auth',
                url: profile.picture
            },
            emailVerified: true
        });

        user.updateLastLogin(ipAddress, 'OAuth Client', 'Google Gateway');
        user.logActivity('OAuth Register', 'New Google OAuth profile created successfully', ipAddress, userAgent);
        await user.save({ validateBeforeSave: false });
    }

    sendToken(user, 200, res);
});

