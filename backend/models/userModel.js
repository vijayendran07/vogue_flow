const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const loginHistorySchema = new mongoose.Schema({
    loginTime: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    browser: {
        type: String
    },
    device: {
        type: String
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    }
});

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [50, 'Name cannot exceed 50 characters'],
        minLength: [2, 'Name should have more than 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false,
        minLength: [8, 'Password should be greater than 8 characters'],
        select: false,
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
            default: 'https://res.cloudinary.com/demo/image/upload/v1234567890/default-avatar.png'
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    dateOfBirth: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super-admin', 'manager'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockReason: {
        type: String,
        enum: ['fraud-activity', 'spam', 'fake-account', 'manual-restriction', 'policy-violation'],
        default: null
    },
    blockedAt: {
        type: Date
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
        type: Date
    },
    loginHistory: [loginHistorySchema],
    activityLogs: [activityLogSchema],
    addresses: [{
        type: {
            type: String,
            enum: ['shipping', 'billing'],
            default: 'shipping'
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    orderHistory: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        totalAmount: Number,
        status: String,
        createdAt: Date
    }],
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    supportTickets: [{
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SupportTicket'
        },
        status: String,
        createdAt: Date
    }]
}, {
    timestamps: true
});

// Index for better performance
// Note: email and phone already have indexes from unique: true constraint
userSchema.index({ role: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ totalSpent: -1 });
userSchema.index({ isDeleted: 1 });

// Hash password and generate referral code before saving
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    if (this.isNew && !this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});

// JWT Token
userSchema.methods.getJWTToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare Password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

// Generate Email Verification Token
userSchema.methods.getEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// Log activity
userSchema.methods.logActivity = function(action, details, ipAddress, userAgent) {
    this.activityLogs.push({
        action,
        details,
        ipAddress,
        userAgent
    });

    // Keep only last 100 activities
    if (this.activityLogs.length > 100) {
        this.activityLogs = this.activityLogs.slice(-100);
    }
};

// Update last login
userSchema.methods.updateLastLogin = function(ipAddress, browser, device) {
    this.lastLogin = new Date();
    this.loginHistory.push({
        ipAddress,
        browser,
        device,
        status: 'success'
    });

    // Keep only last 50 login records
    if (this.loginHistory.length > 50) {
        this.loginHistory = this.loginHistory.slice(-50);
    }
};

// Check if user is online (last login within 5 minutes)
userSchema.methods.isOnline = function() {
    if (!this.lastLogin) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastLogin > fiveMinutesAgo;
};

module.exports = mongoose.model('User', userSchema);
