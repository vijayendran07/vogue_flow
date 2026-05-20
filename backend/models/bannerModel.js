const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter banner title'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true,
        default: ''
    },
    tag: {
        type: String,
        trim: true,
        default: ''
    },
    bgImage: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    brands: {
        type: String,
        trim: true,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
