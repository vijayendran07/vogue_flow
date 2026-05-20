const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
    },
    parentCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
