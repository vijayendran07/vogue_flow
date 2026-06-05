import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminAnalytics, clearErrors } from '../../redux/slices/analyticsSlice';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiBox, FiShoppingCart, FiDollarSign, FiClock, FiCheckCircle, FiAlertTriangle, FiLayers, FiSearch, FiBell, FiPlus, FiList, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
};

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend }) => (
    <motion.div 
        variants={itemVariants} 
        whileHover={{ y: -6, scale: 1.01 }}
        className="bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl rounded-[32px] p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5 opacity-50 transform group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">{title}</p>
                <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight leading-none">{value}</h3>
                {trend && (
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-3.5 font-bold flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40">{trend}</span> 
                        <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px]">this month</span>
                    </p>
                )}
            </div>
            <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-inner backdrop-blur-md bg-white/20 border border-white/20`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, data } = useSelector((state) => state.analytics);

    const [showNotifications, setShowNotifications] = useState(false);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
    const bellButtonRef = useRef(null);
    const [notificationPosition, setNotificationPosition] = useState({ top: 96, right: 16 });
    const notificationPanelRef = useRef(null);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        dispatch(getAdminAnalytics());
    }, [dispatch, error]);

    const notifications = [];
    if (data) {
        if (data.outOfStockProducts > 0) {
            notifications.push({
                id: 'stock-alert',
                type: 'stock',
                title: 'Out of Stock Alert',
                message: `${data.outOfStockProducts} products are currently out of stock!`,
                time: 'Just now',
                unread: true
            });
        }
        if (data.pendingOrders > 0) {
            notifications.push({
                id: 'orders-alert',
                type: 'orders',
                title: 'Pending Orders',
                message: `There are ${data.pendingOrders} pending orders to process.`,
                time: 'Recent',
                unread: true
            });
        }
        if (data.recentOrders && data.recentOrders.length > 0) {
            const newestOrder = data.recentOrders[0];
            notifications.push({
                id: `order-${newestOrder._id}`,
                type: 'order',
                title: 'New Order Received',
                message: `Order #${newestOrder._id.substring(0,8)} by ${newestOrder.user?.name || 'Guest'} for ${formatCurrency(newestOrder.totalPrice)}.`,
                time: new Date(newestOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: false
            });
        }
        if (data.recentUsers && data.recentUsers.length > 0) {
            const newestUser = data.recentUsers[0];
            notifications.push({
                id: `user-${newestUser._id}`,
                type: 'user',
                title: 'New User Registered',
                message: `${newestUser.name} registered a new account.`,
                time: new Date(newestUser.createdAt).toLocaleDateString(),
                unread: false
            });
        }
    }

    const visibleNotifications = notifications.filter((n) => !dismissedNotificationIds.includes(n.id));

    const handleDeleteNotification = (id) => {
        setDismissedNotificationIds((prev) => [...prev, id]);
    };

    const handleClearAllNotifications = () => {
        setDismissedNotificationIds(notifications.map((n) => n.id));
    };

    useEffect(() => {
        if (!showNotifications) return;

        const updatePosition = () => {
            if (!bellButtonRef.current) return;
            const rect = bellButtonRef.current.getBoundingClientRect();
            const panelWidth = window.innerWidth < 640 ? window.innerWidth - 32 : 384;
            const right = Math.max(16, window.innerWidth - rect.right);
            const top = rect.bottom + 12;

            setNotificationPosition({
                top,
                right: Math.max(16, Math.min(right, window.innerWidth - panelWidth - 16))
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [showNotifications]);

    useEffect(() => {
        if (!showNotifications) return;

        const handleOutside = (event) => {
            const clickedBell = bellButtonRef.current?.contains(event.target);
            const clickedPanel = notificationPanelRef.current?.contains(event.target);
            if (!clickedBell && !clickedPanel) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [showNotifications]);

    return (
        <div className="relative min-h-screen w-full container mx-auto px-4 py-8 max-w-7xl select-none">
            {/* Background glowing mesh circles */}
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Admin Header with Search and Notifications */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/40 dark:bg-black/35 backdrop-blur-xl p-5 rounded-[28px] border border-white/20 dark:border-white/10 shadow-xl">
                <h2 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight uppercase">Dashboard Overview</h2>
                
                <div className="flex items-center w-full md:w-auto justify-end">
                    <div className="relative">
                        <button
                            ref={bellButtonRef}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 rounded-full bg-white/30 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors backdrop-blur-md"
                        >
                            <FiBell size={20} />
                            {visibleNotifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-gray-800"></span>
                                </span>
                            )}
                        </button>
                        
                        {showNotifications && typeof document !== 'undefined' && createPortal(
                                <motion.div
                                    ref={notificationPanelRef}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ top: notificationPosition.top, right: notificationPosition.right }}
                                    className="fixed w-[calc(100vw-2rem)] sm:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden z-[9999] p-2"
                                >
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-gray-950 dark:text-white">Admin Notifications</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">{visibleNotifications.length} Alerts</span>
                                            {visibleNotifications.length > 0 && (
                                                <button
                                                    onClick={handleClearAllNotifications}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto space-y-1.5 py-2">
                                        {visibleNotifications.length === 0 ? (
                                            <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                No notifications at this time
                                            </div>
                                        ) : (
                                            visibleNotifications.map((n) => (
                                                <div key={n.id} className="p-3 rounded-2xl bg-gray-50/50 dark:bg-black/20 hover:bg-gray-100/50 dark:hover:bg-black/30 transition duration-200 border border-transparent hover:border-gray-200/40">
                                                    <div className="flex justify-between items-start mb-1 gap-2">
                                                        <h4 className="text-xs font-black text-gray-955 dark:text-white leading-tight">{n.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold whitespace-nowrap">{n.time}</span>
                                                            <button
                                                                onClick={() => handleDeleteNotification(n.id)}
                                                                className="text-gray-400 hover:text-red-500 transition"
                                                                title="Delete notification"
                                                            >
                                                                <FiX className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>,
                                document.body
                            )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} height={120} className="rounded-[32px] dark:opacity-20" />)}
                </div>
            ) : data && Object.keys(data).length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10">
                    
                    {/* 8-Grid Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Revenue" value={formatCurrency(data.totalSales)} icon={FiDollarSign} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" trend="+12.5%" />
                        <StatCard title="Total Orders" value={data.totalOrders} icon={FiShoppingCart} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" trend="+8.2%" />
                        <StatCard title="Total Products" value={data.totalProducts} icon={FiBox} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" />
                        <StatCard title="Total Users" value={data.totalUsers} icon={FiUsers} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" trend="+5.4%" />
                        
                        <StatCard title="Pending Orders" value={data.pendingOrders} icon={FiClock} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" />
                        <StatCard title="Delivered Orders" value={data.deliveredOrders} icon={FiCheckCircle} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" />
                        <StatCard title="Out of Stock" value={data.outOfStockProducts} icon={FiAlertTriangle} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" />
                        <StatCard title="Categories" value={data.totalCategories} icon={FiLayers} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100/60 dark:bg-blue-900/20" />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link to="/admin/product/new" className="flex items-center justify-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white p-4.5 rounded-2xl shadow-xl transition-all duration-300 group">
                            <FiPlus className="group-hover:scale-110 transition-transform" /> <span className="font-bold text-xs uppercase tracking-wider">Add Product</span>
                        </Link>
                        <Link to="/admin/categories" className="flex items-center justify-center space-x-2 bg-white/40 dark:bg-black/35 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-black/45 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 p-4.5 rounded-2xl shadow-lg transition-all duration-300">
                            <FiLayers /> <span className="font-bold text-xs uppercase tracking-wider">Manage Categories</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center justify-center space-x-2 bg-white/40 dark:bg-black/35 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-black/45 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 p-4.5 rounded-2xl shadow-lg transition-all duration-300">
                            <FiList /> <span className="font-bold text-xs uppercase tracking-wider">View Orders</span>
                        </Link>
                        <Link to="/admin/users" className="flex items-center justify-center space-x-2 bg-white/40 dark:bg-black/35 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-black/45 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 p-4.5 rounded-2xl shadow-lg transition-all duration-300">
                            <FiUsers /> <span className="font-bold text-xs uppercase tracking-wider">Manage Users</span>
                        </Link>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Revenue Area Chart */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl rounded-[32px] p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-md font-black text-gray-950 dark:text-white uppercase tracking-wider">Revenue Analytics</h3>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="99%" height={320}>
                                    <AreaChart data={data.monthlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                                        <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000)+'k' : value}`} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <LineTooltip 
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                                            formatter={(value) => [formatCurrency(value), "Revenue"]}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Order Status Doughnut Chart */}
                        <motion.div variants={itemVariants} className="bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl rounded-[32px] p-6">
                            <h3 className="text-md font-black text-gray-950 dark:text-white uppercase tracking-wider mb-6">Order Distribution</h3>
                            <div className="h-80 w-full">
                                {data.orderStatusData && data.orderStatusData.length > 0 ? (
                                    <ResponsiveContainer width="99%" height={320}>
                                        <PieChart>
                                            <Pie
                                                data={data.orderStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.orderStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <PieTooltip 
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <FiBox className="w-12 h-12 mb-2 opacity-50 animate-pulse" />
                                        <p className="text-xs uppercase tracking-wider font-extrabold text-gray-400">No order data available</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Orders Table */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <h3 className="text-md font-black text-gray-950 dark:text-white uppercase tracking-wider">Recent Orders</h3>
                                <Link to="/admin/orders" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-black uppercase tracking-wider">View All</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/10 dark:bg-black/20 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-white/10">
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {data.recentOrders?.map(order => (
                                            <tr key={order._id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400">#{order._id.substring(0,8)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-primary-100/60 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs mr-3 border border-primary-200/50">
                                                            {order.user?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-gray-900 dark:text-white">{order.user?.name || 'Guest'}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">{order.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-black text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-lg font-black ${
                                                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200/50' :
                                                        order.orderStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200/50' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-300 border border-gray-200/50'
                                                    }`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!data.recentOrders || data.recentOrders.length === 0) && (
                                    <div className="p-8 text-center text-xs uppercase tracking-wider font-extrabold text-gray-500">No recent orders found.</div>
                                )}
                            </div>
                        </motion.div>

                        {/* Top Selling Products & Users */}
                        <div className="space-y-6">
                            {/* Top Products */}
                            <motion.div variants={itemVariants} className="bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-white/10">
                                    <h3 className="text-md font-black text-gray-950 dark:text-white uppercase tracking-wider">Top Products</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    {data.topSellingProducts?.map(product => (
                                        <Link to={`/product/${product._id}`} key={product._id} className="flex items-center group">
                                            <img src={product.images[0]?.url} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md" />
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-905 dark:text-white truncate group-hover:text-primary-600 transition-colors">{product.name}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-gray-500 font-bold">{formatCurrency(product.price)}</span>
                                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">{product.ratings} ★</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {(!data.topSellingProducts || data.topSellingProducts.length === 0) && (
                                        <p className="text-xs uppercase tracking-wider font-extrabold text-gray-500 text-center py-4">No products available</p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Recent Users */}
                            <motion.div variants={itemVariants} className="bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-white/10">
                                    <h3 className="text-md font-black text-gray-950 dark:text-white uppercase tracking-wider">Newest Users</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    {data.recentUsers?.map(user => (
                                        <div key={user._id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                <div className="ml-3">
                                                    <p className="text-xs font-black text-gray-950 dark:text-white">{user.name}</p>
                                                    <p className="text-[9px] text-gray-500 font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-[9px] uppercase tracking-wider font-black rounded-md ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50' : 'bg-gray-100 text-gray-600 dark:bg-gray-850 dark:text-gray-400 border border-gray-200/50'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            ) : null}
        </div>
    );
};

export default AdminDashboard;
