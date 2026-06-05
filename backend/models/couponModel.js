const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please enter the Coupon Code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: [true, 'Please enter Discount Percentage'],
        min: 1,
        max: 100
    },
    expireAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bgImage: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
