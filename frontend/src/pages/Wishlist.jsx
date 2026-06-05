import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { syncWishlist, removeFromWishlistThunk } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';
import { optimizeUnsplashUrl } from '../utils/imageOptimizer';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } }
};

const Wishlist = () => {
    const { wishlistItems = [], loading } = useSelector((state) => state.wishlist);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(syncWishlist());
        }
    }, [dispatch, isAuthenticated]);

    const handleRemove = (productId) => {
        dispatch(removeFromWishlistThunk(productId));
        toast.info('Removed from wishlist');
    };

    const handleAddToCart = (item) => {
        dispatch(addToCart({
            product: item._id,
            name: item.name,
            price: item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price,
            image: item.images?.[0]?.url || 'https://via.placeholder.com/300',
            stock: item.stock,
            quantity: 1
        }));
        toast.success(`${item.name} added to cart`);
    };

    return (
        <div className="min-h-screen bg-[#0f1b2e] dark:bg-[#0a1120] text-white antialiased transition-colors duration-300 w-full pt-10 pb-20">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 min-h-[60vh]">
                <h2 className="text-3xl font-black text-white mb-8 border-b pb-4 border-white/10 flex items-center gap-3">
                    <FiHeart className="text-red-500 fill-red-500" />
                    MY WISHLIST
                    {wishlistItems.length > 0 && (
                        <span className="ml-2 text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full">
                            {wishlistItems.length} {wishlistItems.length !== 1 ? 'ITEMS' : 'ITEM'}
                        </span>
                    )}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1,2,3,4].map(n => (
                            <div key={n} className="bg-white/5 rounded-3xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
                    >
                        <motion.div
                            animate={{ y: [-10, 0, -10] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <FiHeart className="mx-auto h-20 w-20 text-white/20 mb-6" />
                        </motion.div>
                        <h3 className="text-2xl text-white font-black tracking-tight mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-400 text-sm mb-6">Save items you love to review them later.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-900 rounded-full hover:bg-white/90 transition font-bold text-xs uppercase tracking-wider"
                        >
                            Browse Products
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence>
                            {wishlistItems.map((item) => (
                                <motion.div
                                    key={item._id}
                                    variants={itemVariants}
                                    layout
                                    exit="exit"
                                    className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    {/* Product Image */}
                                    <Link to={`/product/${item._id}`} className="block relative overflow-hidden aspect-square bg-white/5">
                                        <img
                                            src={optimizeUnsplashUrl(item.images?.[0]?.url || 'https://via.placeholder.com/300', 300)}
                                            alt={item.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleRemove(item._id); }}
                                            className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-red-400 hover:text-red-300 hover:bg-black/80 transition shadow"
                                            title="Remove from wishlist"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        {item.discountPrice && item.discountPrice < item.price && (
                                            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                                Sale
                                            </span>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                {item.category?.name || 'Product'}
                                            </p>
                                            <Link to={`/product/${item._id}`}>
                                                <h3 className="font-bold text-white text-sm line-clamp-2 hover:text-pink-400 transition-colors">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="font-black text-white">
                                                    {formatCurrency(item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price)}
                                                </span>
                                                {item.discountPrice && item.discountPrice < item.price && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t border-white/10">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.stock === 0}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <FiShoppingCart className="w-3.5 h-3.5" />
                                                {item.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className="p-2.5 rounded-xl border border-white/10 text-red-400 hover:bg-red-950/20 transition"
                                                title="Remove"
                                            >
                                                <FiTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
