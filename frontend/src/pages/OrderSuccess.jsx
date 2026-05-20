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
        <div className="container mx-auto px-4 py-16 max-w-3xl flex items-center justify-center min-h-[70vh]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center w-full relative overflow-hidden"
            >
                {/* Decorative background blob */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="flex justify-center mb-6 relative"
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-inner">
                        <FiCheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Order Placed Successfully!
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                    Thank you for your purchase. We've received your order and are getting it ready for dispatch.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Status</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> Processing
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                            <p className="font-medium text-gray-900 dark:text-white">{paymentMethod}</p>
                        </div>
                        {displayOrder && displayOrder._id && (
                            <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Total</p>
                                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                    {isPaid ? (
                                        <>Amount Paid: <span className="text-gray-900 dark:text-white">{formatCurrency(displayOrder.totalPrice)}</span></>
                                    ) : (
                                        <>Please keep <span className="text-gray-900 dark:text-white">{formatCurrency(displayOrder.totalPrice)}</span> ready at the time of delivery.</>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link 
                        to="/orders/me" 
                        className="flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <FiPackage className="mr-2" /> View My Orders
                    </Link>
                    <Link 
                        to="/products" 
                        className="flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg"
                    >
                        <FiShoppingBag className="mr-2" /> Continue Shopping
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
