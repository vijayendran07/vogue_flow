import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch } from 'react-redux';
import { addToCart, removeCartItem } from '../../redux/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { optimizeUnsplashUrl } from '../../utils/imageOptimizer';

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
                    <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-400 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
                        
                        {/* Premium edge tracking highlight overlay */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                        {/* Left Asset Render */}
                        <Link to={`/product/${item.product}`} className="flex-shrink-0 w-full sm:w-32 md:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative block">
                            <img
                                src={optimizeUnsplashUrl(item.image || 'https://via.placeholder.com/300', 200)}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
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
                                <span className="text-[10px] font-bold text-gray-405 uppercase tracking-widest block mb-0.5">
                                    VOGUEFLOW EXCLUSIVE
                                </span>
                                <Link to={`/product/${item.product}`} className="inline-block">
                                    <h3 className="text-base md:text-lg font-black text-white group-hover:text-pink-400 transition-colors line-clamp-2 tracking-tight leading-snug">
                                        {item.name}
                                    </h3>
                                </Link>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold text-white">
                                    {formatCurrency(item.price)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Each
                                </span>
                            </div>

                            {/* Counter Controls Suite */}
                            <div className="flex items-center gap-6 pt-2">
                                <div className="h-10 bg-white/5 border border-white/10 rounded-xl flex items-center p-0.5 w-28 select-none">
                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => decreaseQuantity(item.product, item.quantity)}
                                        disabled={item.quantity === 1}
                                        className="w-8 h-full rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-30"
                                    >
                                        <FiMinus className="w-3 h-3" />
                                    </motion.button>
                                    
                                    <span className="flex-1 text-center font-black text-xs text-white">
                                        {item.quantity}
                                    </span>

                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => increaseQuantity(item.product, item.quantity, item.stock)}
                                        disabled={item.stock <= item.quantity}
                                        className="w-8 h-full rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-30"
                                    >
                                        <FiPlus className="w-3 h-3" />
                                    </motion.button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRemove}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-all duration-200"
                                >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Right Line Total Highlight viewport */}
                        <div className="hidden md:block w-px h-16 bg-white/10 mx-6 self-center" />
                        <div className="flex md:flex-col items-baseline justify-between md:justify-center md:items-start w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 md:mb-1 block">
                                LINE TOTAL
                            </span>
                            
                            <motion.span
                                key={itemTotal}
                                initial={{ scale: 1.15 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl sm:text-2xl font-black text-white tracking-tight"
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
