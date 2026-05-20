import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch } from 'react-redux';
import { addToCart, removeCartItem } from '../../redux/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';

const CartItem = ({ item }) => {
    const dispatch = useDispatch();
    const [isRemoving, setIsRemoving] = useState(false);

    const increaseQuantity = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (stock <= quantity) return;
        dispatch(addToCart({ ...item, quantity: newQty }));
    };

    const decreaseQuantity = (id, quantity) => {
        const newQty = quantity - 1;
        if (1 >= quantity) return;
        dispatch(addToCart({ ...item, quantity: newQty }));
    };

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            dispatch(removeCartItem(item.product));
        }, 350);
    };

    const itemTotal = item.price * item.quantity;

    return (
        <AnimatePresence>
            {!isRemoving && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative group"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/80 p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-400 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
                        
                        {/* Premium edge tracking highlight overlay */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-900 dark:bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                        {/* Left Asset Render */}
                        <Link to={`/product/${item.product}`} className="flex-shrink-0 w-full sm:w-32 md:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100/50 dark:border-gray-800 relative block">
                            <img
                                src={item.image || 'https://via.placeholder.com/300'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {item.stock <= 5 && item.stock > 0 && (
                                <span className="absolute top-2 left-2 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Low
                                </span>
                            )}
                        </Link>

                        {/* Mid Info Block */}
                        <div className="flex-1 space-y-2 w-full md:w-auto">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                                    VogueFlow Exclusive
                                </span>
                                <Link to={`/product/${item.product}`} className="inline-block">
                                    <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 tracking-tight leading-snug">
                                        {item.name}
                                    </h3>
                                </Link>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(item.price)}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    Each
                                </span>
                            </div>

                            {/* Counter Controls Suite */}
                            <div className="flex items-center gap-4 pt-2">
                                <div className="h-10 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center p-0.5 w-28 select-none">
                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => decreaseQuantity(item.product, item.quantity)}
                                        disabled={item.quantity === 1}
                                        className="w-8 h-full rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-30"
                                    >
                                        <FiMinus className="w-3 h-3" />
                                    </motion.button>
                                    
                                    <span className="flex-1 text-center font-black text-xs text-gray-900 dark:text-white">
                                        {item.quantity}
                                    </span>

                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => increaseQuantity(item.product, item.quantity, item.stock)}
                                        disabled={item.stock <= item.quantity}
                                        className="w-8 h-full rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-30"
                                    >
                                        <FiPlus className="w-3 h-3" />
                                    </motion.button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleRemove}
                                    title="Remove item"
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 ml-auto md:ml-0"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Right Line Total Highlight viewport */}
                        <div className="flex md:flex-col items-baseline justify-between md:justify-center md:items-end w-full md:w-auto border-t md:border-t-0 border-gray-100 dark:border-gray-800/80 pt-3 md:pt-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 md:mb-1 block">
                                Line Total
                            </span>
                            
                            <motion.span
                                key={itemTotal}
                                initial={{ scale: 1.15, color: '#2563EB' }}
                                animate={{ scale: 1, color: 'inherit' }}
                                transition={{ duration: 0.3 }}
                                className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight"
                            >
                                {formatCurrency(itemTotal)}
                            </motion.span>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartItem;
