const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

exports.getAdminAnalytics = catchAsyncErrors(async (req, res, next) => {
    // Basic Counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const totalCategories = await Category.countDocuments();
    
    // Top 5 recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    // Top 5 selling products (proxy by ratings/reviews)
    const topSellingProducts = await Product.find().sort({ numOfReviews: -1, ratings: -1 }).limit(5);

    // Top 5 recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email avatar');

    const orders = await Order.find();
    
    let totalSales = 0;
    let orderStatusCounts = {
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0,
    };

    orders.forEach((order) => {
        totalSales += order.totalPrice;
        
        if (orderStatusCounts[order.orderStatus] !== undefined) {
            orderStatusCounts[order.orderStatus] += 1;
        } else {
            orderStatusCounts[order.orderStatus] = 1;
        }
    });

    const pendingOrders = orderStatusCounts.Pending || 0;
    const deliveredOrders = orderStatusCounts.Delivered || 0;

    const orderStatusData = Object.keys(orderStatusCounts).map(key => ({
        name: key,
        value: orderStatusCounts[key]
    }));

    const monthlySalesMap = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 12 months with 0
    const d = new Date();
    for (let i = 11; i >= 0; i--) {
        const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const monthName = months[pastDate.getMonth()];
        monthlySalesMap[monthName] = 0;
    }

    orders.forEach(order => {
        const month = months[new Date(order.createdAt).getMonth()];
        if(monthlySalesMap[month] !== undefined) {
            monthlySalesMap[month] += order.totalPrice;
        }
    });

    const monthlySalesData = Object.keys(monthlySalesMap).map(key => ({
        month: key,
        sales: monthlySalesMap[key]
    }));

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalProducts,
            outOfStockProducts,
            totalCategories,
            totalOrders: orders.length,
            totalSales,
            pendingOrders,
            deliveredOrders,
            orderStatusData,
            monthlySalesData,
            recentUsers,
            topSellingProducts,
            recentOrders
        }
    });
});
