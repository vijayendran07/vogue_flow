import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, updateOrder, updateShipping, generateInvoice, clearErrors, resetOrderState } from '../../redux/slices/orderSlice';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderTimeline from '../../components/OrderTimeline';
import { downloadInvoice, printInvoice } from '../../utils/invoice';

const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
const shippingStatuses = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'];

const ProcessOrder = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { loading, error, order, isUpdated, isInvoiceGenerated } = useSelector((state) => state.order);
    const [status, setStatus] = useState('');
    const [shippingData, setShippingData] = useState({
        courier: '',
        trackingNumber: '',
        estimatedDeliveryDate: '',
        shippingStatus: '',
        note: '',
    });

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isUpdated) {
            toast.success('Order updated successfully');
            dispatch(resetOrderState());
            dispatch(getOrderDetails(id));
        }
        if (isInvoiceGenerated) {
            toast.success('Invoice generated successfully');
            dispatch(resetOrderState());
        }
        dispatch(getOrderDetails(id));
    }, [dispatch, error, id, isUpdated, isInvoiceGenerated]);

    const handleStatusChange = (e) => setStatus(e.target.value);

    const updateOrderSubmitHandler = (e) => {
        e.preventDefault();
        if (!status) return toast.error('Please select a status');
        dispatch(updateOrder({ id, status, note: `Admin changed status to ${status}` }));
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        if (!shippingData.courier || !shippingData.trackingNumber) {
            return toast.error('Courier and tracking number are required');
        }
        dispatch(updateShipping({ id, ...shippingData }));
    };

    const handleInvoice = async () => {
        const resultAction = await dispatch(generateInvoice(id));
        if (generateInvoice.fulfilled.match(resultAction)) {
            downloadInvoice(resultAction.payload);
        }
    };

    const statusChoices = useMemo(() => {
        if (!order.orderStatus) return statusOptions;
        const currentIndex = statusOptions.indexOf(order.orderStatus);
        return statusOptions.slice(currentIndex + 1).length ? statusOptions.slice(currentIndex + 1) : ['Delivered'];
    }, [order.orderStatus]);

    const billing = order.billingInfo || order.shippingInfo;
    const timeline = order.timeline || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading Order Details...</div>
            ) : order && order.user ? (
                <div className="space-y-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-10)}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()} by {order.user.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={handleInvoice} className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">Generate Invoice</button>
                            <button onClick={() => printInvoice(order)} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white">Print Invoice</button>
                            <Link to="/admin/orders" className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white">Back to Orders</Link>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Details</h3>
                                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Name:</span> {order.user.name}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Email:</span> {order.user.email}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Phone:</span> {order.shippingInfo.phoneNo}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Status:</span> <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{order.orderStatus}</span></p>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h3>
                                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Method:</span> {order.paymentMethod || order.paymentInfo?.method || 'COD'}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Status:</span> {order.paymentStatus || order.paymentInfo?.status || 'Pending'}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Transaction:</span> {order.paymentInfo?.id || 'N/A'}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Subtotal:</span> {formatCurrency(order.itemsPrice)}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Shipping:</span> {formatCurrency(order.shippingPrice)}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Tax:</span> {formatCurrency(order.taxPrice)}</p>
                                        <p><span className="font-semibold text-gray-900 dark:text-white">Discount:</span> {formatCurrency(order.discountPrice)}</p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">Total: {formatCurrency(order.totalPrice)}</p>
                                    </div>
                                </section>
                            </div>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping & Billing</h3>
                                <div className="mt-5 grid gap-6 md:grid-cols-2">
                                    <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</h4>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.address}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pinCode}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.country}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.phoneNo}</p>
                                    </div>
                                    <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Billing Address</h4>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{billing.address}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{billing.city}, {billing.state} {billing.pinCode}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{billing.country}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{billing.phoneNo}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h3>
                                <div className="mt-5 space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item.product} className="grid gap-4 md:grid-cols-[auto_1fr_auto] items-center rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                            <img src={item.image} alt={item.name} className="h-20 w-20 rounded-3xl object-cover" />
                                            <div>
                                                <Link to={`/product/${item.product}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600">{item.name}</Link>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Variant: {item.variant || 'Default'}</p>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Process Order</h3>
                                <form onSubmit={updateOrderSubmitHandler} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Status</label>
                                        <select
                                            value={status}
                                            onChange={handleStatusChange}
                                            className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        >
                                            <option value="">Choose New Status</option>
                                            {statusChoices.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                                        disabled={loading || !status}
                                    >
                                        Update Status
                                    </button>
                                </form>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Tracking</h3>
                                <form onSubmit={handleShippingSubmit} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Courier Company</label>
                                        <input
                                            type="text"
                                            value={shippingData.courier}
                                            onChange={(e) => setShippingData((prev) => ({ ...prev, courier: e.target.value }))}
                                            className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            placeholder="Example: ShipFast"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                                        <input
                                            type="text"
                                            value={shippingData.trackingNumber}
                                            onChange={(e) => setShippingData((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                                            className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            placeholder="Enter tracking code"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</label>
                                        <input
                                            type="date"
                                            value={shippingData.estimatedDeliveryDate}
                                            onChange={(e) => setShippingData((prev) => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                                            className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Status</label>
                                        <select
                                            value={shippingData.shippingStatus}
                                            onChange={(e) => setShippingData((prev) => ({ ...prev, shippingStatus: e.target.value }))}
                                            className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        >
                                            <option value="">Choose shipping stage</option>
                                            {shippingStatuses.map((statusOption) => (
                                                <option key={statusOption} value={statusOption}>{statusOption}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update Note</label>
                                        <textarea
                                            rows="3"
                                            value={shippingData.note}
                                            onChange={(e) => setShippingData((prev) => ({ ...prev, note: e.target.value }))}
                                            className="mt-2 block w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            placeholder="Add an internal shipment note"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Update Shipping
                                    </button>
                                </form>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Timeline</h3>
                                <div className="mt-5">
                                    <OrderTimeline timeline={timeline} />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProcessOrder;
