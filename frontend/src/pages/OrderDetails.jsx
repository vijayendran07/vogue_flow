import React, { useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, cancelOrder, clearErrors, resetOrderState } from '../redux/slices/orderSlice';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderTimeline from '../components/OrderTimeline';
import { downloadInvoice, printInvoice } from '../utils/invoice';

const OrderDetails = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { loading, error, order, isCancelled } = useSelector((state) => state.order);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isCancelled) {
            toast.success('Order cancelled successfully');
            dispatch(resetOrderState());
            dispatch(getOrderDetails(id));
        } else {
            dispatch(getOrderDetails(id));
        }
    }, [dispatch, error, id, isCancelled]);

    const cancelOrderHandler = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            dispatch(cancelOrder({ id, cancelReason: 'Customer cancelled order.' }));
        }
    };

    const canCancel = order && ['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus);
    const billing = order.billingInfo || order.shippingInfo;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading order details...</div>
            ) : order && order.user ? (
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-10)}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => downloadInvoice(order)} className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">Download Invoice</button>
                            <button onClick={() => printInvoice(order)} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white">Print Invoice</button>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                        <div className="space-y-6">
                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer & Delivery</h3>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Customer</h4>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{order.user.name}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.user.email}</p>
                                    </div>
                                    <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Address</h4>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.address}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.city}, {order.shippingInfo.state}, {order.shippingInfo.pinCode}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.country}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{order.shippingInfo.phoneNo}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Address</h3>
                                <div className="mt-5 rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{billing.address}</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{billing.city}, {billing.state}, {billing.pinCode}</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{billing.country}</p>
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
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Variant: {item.variant || 'Default'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty {item.quantity}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-6">
                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                                <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
                                    <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(order.shippingPrice)}</span></div>
                                    <div className="flex justify-between"><span>GST</span><span>{formatCurrency(order.taxPrice)}</span></div>
                                    <div className="flex justify-between"><span>Discount</span><span>{formatCurrency(order.discountPrice)}</span></div>
                                </div>
                                <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
                                    <div className="flex justify-between"><span>Total</span><span>{formatCurrency(order.totalPrice)}</span></div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Details</h3>
                                <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    <p><span className="font-semibold text-gray-900 dark:text-white">Courier:</span> {order.courier || 'N/A'}</p>
                                    <p><span className="font-semibold text-gray-900 dark:text-white">Tracking No:</span> {order.trackingNumber || 'N/A'}</p>
                                    <p><span className="font-semibold text-gray-900 dark:text-white">Estimated Delivery:</span> {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                                    <p><span className="font-semibold text-gray-900 dark:text-white">Delivery Status:</span> {order.shippingStatus || 'Pending'}</p>
                                    <p><span className="font-semibold text-gray-900 dark:text-white">Invoice:</span> {order.invoiceNumber || 'Pending'}</p>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Timeline</h3>
                        <div className="mt-5">
                            <OrderTimeline timeline={order.timeline || []} />
                        </div>
                    </section>

                    {canCancel && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/10 dark:text-red-200">
                            <p className="font-semibold">Need to cancel?</p>
                            <p className="mt-2">You can cancel this order now because it has not moved to delivery yet.</p>
                            <button onClick={cancelOrderHandler} className="mt-4 inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">Cancel Order</button>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default OrderDetails;
