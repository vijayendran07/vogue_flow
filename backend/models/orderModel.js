const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
});

const timelineSchema = new mongoose.Schema({
    status: { type: String, required: true },
    message: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'admin' },
});

const orderSchema = new mongoose.Schema({
    shippingInfo: { type: addressSchema, required: true },
    billingInfo: { type: addressSchema, required: false },
    orderItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            variant: {
                type: String,
                default: '',
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        required: true,
        default: 'Pending',
    },
    paymentInfo: {
        id: String,
        status: String,
        method: String,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: Date,
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded', 'Cancel Requested', 'Refund Initiated'],
        required: true,
        default: 'Pending',
    },
    shippingStatus: {
        type: String,
        enum: ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'],
        default: 'Pending',
    },
    trackingNumber: { type: String },
    courier: { type: String },
    estimatedDeliveryDate: Date,
    timeline: [timelineSchema],
    invoiceNumber: { type: String, unique: true, sparse: true },
    cancelReason: { type: String, default: '' },
    refundStatus: {
        type: String,
        enum: ['NotRefunded', 'Refund Initiated', 'Refunded'],
        default: 'NotRefunded',
    },
    isCancelled: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
