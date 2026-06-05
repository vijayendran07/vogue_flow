const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const mongoose = require('mongoose');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildAdminOrderQuery = (queryParams) => {
    const query = {};

    if (queryParams.status) {
        query.orderStatus = queryParams.status;
    }

    if (queryParams.paymentMethod) {
        query.paymentMethod = queryParams.paymentMethod;
    }

    if (queryParams.startDate || queryParams.endDate) {
        query.createdAt = {};

        if (queryParams.startDate) {
            query.createdAt.$gte = new Date(queryParams.startDate);
        }
        if (queryParams.endDate) {
            query.createdAt.$lte = new Date(queryParams.endDate);
        }
    }

    return query;
};

const createTimelineEntry = (status, message, updatedBy = 'admin') => ({
    status,
    message,
    timestamp: Date.now(),
    updatedBy,
});

const createInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        billingInfo,
        orderItems,
        paymentMethod,
        paymentStatus,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
        courier,
        trackingNumber,
        estimatedDeliveryDate,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        billingInfo: billingInfo || shippingInfo,
        orderItems,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentStatus || 'Pending',
        paymentInfo: paymentInfo || {
            status: paymentStatus || 'Pending',
            method: paymentMethod || 'COD',
        },
        isPaid: paymentStatus === 'Paid',
        paidAt: paymentStatus === 'Paid' ? Date.now() : null,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice: discountPrice || 0,
        totalPrice,
        courier,
        trackingNumber,
        estimatedDeliveryDate,
        user: req.user._id,
        invoiceNumber: createInvoiceNumber(),
        timeline: [
            createTimelineEntry('Pending', 'Order created and awaiting processing', req.user._id.toString()),
        ],
    });

    res.status(201).json({
        success: true,
        order,
    });
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email avatar role');

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
});

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const baseQuery = buildAdminOrderQuery(req.query);

    if (req.query.keyword) {
        const keyword = req.query.keyword.trim();
        const safeKeyword = escapeRegex(keyword);
        const orQuery = [
            { paymentMethod: new RegExp(safeKeyword, 'i') },
            { paymentStatus: new RegExp(safeKeyword, 'i') },
            { courier: new RegExp(safeKeyword, 'i') },
            { trackingNumber: new RegExp(safeKeyword, 'i') },
            { orderStatus: new RegExp(safeKeyword, 'i') },
            { invoiceNumber: new RegExp(safeKeyword, 'i') },
            { 'paymentInfo.id': new RegExp(safeKeyword, 'i') },
        ];

        if (mongoose.Types.ObjectId.isValid(keyword)) {
            orQuery.push({ _id: keyword });
        }

        // Support searching by partial Order ID shown in admin table (e.g. last 8 chars)
        if (keyword.length >= 4) {
            const idMatches = await Order.aggregate([
                {
                    $match: {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: '$_id' },
                                regex: safeKeyword,
                                options: 'i',
                            },
                        },
                    },
                },
                { $project: { _id: 1 } },
                { $limit: 100 },
            ]);

            if (idMatches.length > 0) {
                orQuery.push({ _id: { $in: idMatches.map((doc) => doc._id) } });
            }
        }

        // Support searching orders by Customer Name
        const User = require('../models/userModel');
        const matchedUsers = await User.find({ name: new RegExp(safeKeyword, 'i') }).select('_id');
        if (matchedUsers && matchedUsers.length > 0) {
            orQuery.push({ user: { $in: matchedUsers.map(u => u._id) } });
        }

        baseQuery.$or = orQuery;
    }

    let sortMode = { createdAt: -1 };
    if (req.query.sort === 'oldest') {
        sortMode = { createdAt: 1 };
    }

    const totalOrders = await Order.countDocuments(baseQuery);
    const orders = await Order.find(baseQuery)
        .sort(sortMode)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email');

    const totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
        page,
        pages: Math.ceil(totalOrders / limit),
        count: totalOrders,
    });
});

exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    const { status, note, cancelReason, refundStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    if (order.orderStatus === 'Delivered' && status !== 'Returned' && status !== 'Refunded') {
        return next(new ErrorHandler('Order is already delivered and cannot be updated', 400));
    }

    if (status === 'Shipped') {
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity);
        }
    }

    order.orderStatus = status;
    order.cancelReason = cancelReason || order.cancelReason;
    order.refundStatus = refundStatus || order.refundStatus;
    order.isCancelled = status === 'Cancelled';
    if (status === 'Delivered') {
        order.deliveredAt = Date.now();
    }
    if (status === 'Paid') {
        order.isPaid = true;
        order.paidAt = Date.now();
    }

    order.timeline.push(createTimelineEntry(status, note || `Order status changed to ${status}`, req.user.name || 'admin'));
    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        order,
    });
});

exports.updateShipping = catchAsyncErrors(async (req, res, next) => {
    const { courier, trackingNumber, estimatedDeliveryDate, shippingStatus, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    order.courier = courier || order.courier;
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.estimatedDeliveryDate = estimatedDeliveryDate || order.estimatedDeliveryDate;
    order.shippingStatus = shippingStatus || order.shippingStatus;
    order.timeline.push(createTimelineEntry(shippingStatus || order.shippingStatus, note || 'Shipping information updated', req.user.name || 'admin'));

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        order,
    });
});

exports.bulkUpdateOrders = catchAsyncErrors(async (req, res, next) => {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler('No order ids provided for bulk update', 400));
    }

    const updatedOrders = [];
    for (const id of ids) {
        const order = await Order.findById(id);
        if (!order) continue;
        order.orderStatus = status;
        order.timeline.push(createTimelineEntry(status, `Bulk update to ${status}`, req.user.name || 'admin'));
        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
        }
        await order.save({ validateBeforeSave: false });
        updatedOrders.push(order);
    }

    res.status(200).json({
        success: true,
        updatedCount: updatedOrders.length,
        updatedOrders,
    });
});

exports.generateInvoice = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    if (!order.invoiceNumber) {
        order.invoiceNumber = createInvoiceNumber();
        order.timeline.push(createTimelineEntry('Invoice Generated', 'Invoice number assigned', req.user.name || 'admin'));
        await order.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        success: true,
        order,
    });
});

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
    });
});

exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this Id', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Not authorized to cancel this order', 403));
    }

    if (['Shipped', 'Delivered', 'Returned', 'Refunded'].includes(order.orderStatus)) {
        return next(new ErrorHandler('You cannot cancel an order that has already been processed beyond cancellation', 400));
    }

    order.orderStatus = 'Cancelled';
    order.isCancelled = true;
    order.cancelReason = req.body.cancelReason || 'Cancelled by customer request';
    order.timeline.push(createTimelineEntry('Cancelled', order.cancelReason, 'customer'));
    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Order Cancelled Successfully',
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (!product) return;
    product.stock = Math.max(product.stock - quantity, 0);
    await product.save({ validateBeforeSave: false });
}
