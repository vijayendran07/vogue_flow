import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from '../utils/formatCurrency';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import axios from 'axios';

const OrderSuccess = () => {
    const { order } = useSelector((state) => state.order);
    const location = useLocation();
    const dispatch = useDispatch();
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
    const [isPaid, setIsPaid] = useState(false);
    const [fetchedOrder, setFetchedOrder] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        const orderId = searchParams.get('order_id');

        if (orderId) {
            setIsPaid(true);
            setPaymentMethod('Online Payment (Razorpay)');
            dispatch(clearCart());
            axios.get(`/api/v1/order/${orderId}`, { withCredentials: true })
                .then(({ data }) => {
                    if (data.success) {
                        setFetchedOrder(data.order);
                    }
                })
                .catch(err => console.error("Error fetching order details", err));
        } else if (sessionId) {
            const pendingOrderStr = localStorage.getItem('pendingOrder');
            if (pendingOrderStr) {
                try {
                    const pendingOrder = JSON.parse(pendingOrderStr);
                    pendingOrder.paymentStatus = 'Paid';
                    
                    setPaymentMethod(pendingOrder.paymentMethod || 'Online Payment (Razorpay)');
                    
                    dispatch(createOrder(pendingOrder)).then((res) => {
                        if (res.meta.requestStatus === 'fulfilled') {
                            dispatch(clearCart());
                            localStorage.removeItem('pendingOrder');
                        }
                    });
                } catch (e) {
                    console.error("Error parsing pending order", e);
                }
            }
            setIsPaid(true);
        } else if (order?.paymentMethod) {
            setPaymentMethod(order.paymentMethod);
            setIsPaid(order.paymentStatus === 'Paid');
        }
    }, [location, dispatch, order]);

    const displayOrder = fetchedOrder || order;

    return (
        <div className="min-h-screen bg-[#0f1b2e] dark:bg-[#0a1120] text-white antialiased transition-colors duration-300 w-full pt-16 pb-20">
            <div className="container mx-auto px-4 max-w-3xl flex items-center justify-center min-h-[60vh]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 p-8 md:p-12 rounded-3xl shadow-xl border border-white/10 text-center w-full relative overflow-hidden backdrop-blur-xl"
                >
                    {/* Decorative background blob */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="flex justify-center mb-6 relative"
                    >
                        <div className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center shadow-inner">
                            <FiCheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Order Placed Successfully!
                    </h1>
                    
                    <p className="text-white/60 mb-8 max-w-lg mx-auto text-base">
                        Thank you for your purchase. We've received your order and are getting it ready for dispatch.
                    </p>

                    <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Order Status</p>
                                <p className="font-semibold text-white flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> Processing
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Payment Method</p>
                                <p className="font-semibold text-white">{paymentMethod}</p>
                            </div>
                            {displayOrder && displayOrder._id && (
                                <div className="md:col-span-2 mt-2 pt-4 border-t border-white/10">
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Order Total</p>
                                    <p className="text-xl font-bold text-pink-400">
                                        {isPaid ? (
                                            <>Amount Paid: <span className="text-white">{formatCurrency(displayOrder.totalPrice)}</span></>
                                        ) : (
                                            <>Please keep <span className="text-white">{formatCurrency(displayOrder.totalPrice)}</span> ready at the time of delivery.</>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link 
                            to="/orders/me" 
                            className="flex items-center justify-center px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition"
                        >
                            <FiPackage className="mr-2" /> View My Orders
                        </Link>
                        <Link 
                            to="/products" 
                            className="flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-white/95 transition shadow-lg"
                        >
                            <FiShoppingBag className="mr-2" /> Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccess;
