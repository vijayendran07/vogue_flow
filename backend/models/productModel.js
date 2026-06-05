const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        trim: true,
        default: ''
    },
    color: {
        type: String,
        trim: true,
        default: ''
    },
    storage: {
        type: String,
        trim: true,
        default: ''
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Variant stock cannot be negative']
    },
    priceDifference: {
        type: Number,
        default: 0,
        min: [0, 'Price difference cannot be negative']
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    category: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Category'
            }
        ],
        required: [true, 'Please select at least one product category']
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    },
    sku: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price must be positive']
    },
    discountPrice: {
        type: Number,
        default: 0,
        min: [0, 'Discount price must be positive']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Stock cannot be negative'],
        default: 1
    },
    status: {
        type: String,
        enum: ['Active', 'Draft', 'Hidden'],
        default: 'Active'
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    seoTitle: {
        type: String,
        trim: true,
        default: ''
    },
    seoDescription: {
        type: String,
        trim: true,
        default: ''
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    variants: [variantSchema],
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

productSchema.index({ deleted: 1, status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
