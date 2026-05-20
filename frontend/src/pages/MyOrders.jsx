import React, { useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { myOrders, clearErrors } from '../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye } from 'react-icons/fi';

const MyOrders = () => {
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector((state) => state.order);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        dispatch(myOrders());
    }, [dispatch, error]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">My Orders</h2>
            
            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading Orders...</div>
            ) : orders && orders.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-xl text-gray-600 dark:text-gray-400 mb-4">You have no orders yet.</h3>
                    <Link to="/products" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">Start Shopping</Link>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {orders && orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order._id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{order.orderItems.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(order.totalPrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link to={`/order/${order._id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-900">
                                            <FiEye className="w-5 h-5 inline-block" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
