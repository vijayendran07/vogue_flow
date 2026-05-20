import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, deleteOrder, updateOrder, bulkUpdateOrders, clearErrors, resetOrderState } from '../../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const statusBadge = (status) => {
    const styles = {
        Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        Processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        Shipped: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
        Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        Returned: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
        Refunded: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const paymentBadge = (status) => {
    const styles = {
        COD: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        Paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
        Failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        Refunded: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300',
        Pending: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
    };
    return styles[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
};

const OrderList = () => {
    const dispatch = useDispatch();
    const { loading, error, orders, page, pages, count, isUpdated, isDeleted, bulkUpdateSuccess } = useSelector((state) => state.order);

    const [filters, setFilters] = useState({
        keyword: '',
        status: '',
        paymentMethod: '',
        startDate: '',
        endDate: '',
        sort: 'newest',
        page: 1,
        limit: 12,
    });
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isDeleted) {
            toast.success('Order deleted successfully');
            dispatch(resetOrderState());
        }
        if (isUpdated) {
            toast.success('Order updated successfully');
            dispatch(resetOrderState());
        }
        if (bulkUpdateSuccess) {
            toast.success('Bulk orders updated successfully');
            dispatch(resetOrderState());
            setSelectedOrders([]);
        }
        dispatch(getAllOrders(filters));
    }, [dispatch, error, filters, isDeleted, isUpdated, bulkUpdateSuccess]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const toggleSelection = (id) => {
        setSelectedOrders((prev) =>
            prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedOrders(orders?.map((order) => order._id) || []);
    };

    const clearSelection = () => {
        setSelectedOrders([]);
    };

    const handleBulkUpdate = () => {
        if (!bulkStatus || selectedOrders.length === 0) {
            return toast.error('Select orders and a status for bulk updates');
        }
        dispatch(bulkUpdateOrders({ ids: selectedOrders, status: bulkStatus }));
    };

    const deleteOrderHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            dispatch(deleteOrder(id));
        }
    };

    const updateQuickStatus = (id, status) => {
        dispatch(updateOrder({ id, status }));
    };

    const exportToExcel = () => {
        if (!orders?.length) {
            return toast.error('No orders available to export');
        }
        const worksheet = XLSX.utils.json_to_sheet(
            orders.map((order) => ({
                'Order ID': order._id,
                Customer: order.user?.name || 'Guest',
                Email: order.user?.email || 'N/A',
                'Products Count': order.orderItems.length,
                'Total Amount': order.totalPrice,
                'Payment Method': order.paymentMethod,
                'Payment Status': order.paymentStatus,
                'Order Status': order.orderStatus,
                'Order Date': new Date(order.createdAt).toLocaleString(),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, `orders-export-${Date.now()}.xlsx`);
        toast.success('Orders exported to Excel');
    };

    const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
    const paymentOptions = ['COD', 'Paid', 'Failed', 'Refunded', 'Pending'];

    const filteredOrders = useMemo(() => orders || [], [orders]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Browse orders, update shipment status, export data, and manage workflow from one professional admin view.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={exportToExcel} className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">Export Excel</button>
                    <Link to="/admin/dashboard" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">Back to Dashboard</Link>
                </div>
            </div>

            <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Search</label>
                    <input
                        type="text"
                        value={filters.keyword}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        placeholder="Order ID, customer, courier"
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment</label>
                    <select
                        value={filters.paymentMethod}
                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">All Payments</option>
                        {paymentOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sort</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Date range</p>
                    <div className="mt-3 space-y-3">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4 xl:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Bulk actions</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="">Choose Status</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleBulkUpdate}
                            className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Update Selected
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        >
                            Clear Selection
                        </button>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{selectedOrders.length} order(s) selected.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading orders...</div>
            ) : !filteredOrders?.length ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No orders match your filters.</h3>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Try resetting the filters or adjusting the search query.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        <button onClick={selectAll} className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Select</button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Products</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {filteredOrders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => toggleSelection(order._id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{order._id.slice(-8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.user?.name || 'Guest'}<br/><span className="text-xs text-gray-400">{order.user?.email || 'no-email'}</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.orderItems.length}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(order.paymentStatus || order.paymentMethod)}`}>
                                                {order.paymentStatus || order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <Link to={`/admin/order/${order._id}`} className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                                                <FiEye className="mr-1 h-4 w-4" /> View
                                            </Link>
                                            <button type="button" onClick={() => deleteOrderHandler(order._id)} className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/10 dark:text-red-300">
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Showing {orders?.length || 0} of {count} orders</div>
                <div className="inline-flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(filters.page - 1, 1))}
                        disabled={filters.page === 1}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >Previous</button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Page {filters.page} of {pages}</span>
                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(filters.page + 1, pages))}
                        disabled={filters.page === pages}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >Next</button>
                </div>
            </div>
        </div>
    );
};

export default OrderList;
