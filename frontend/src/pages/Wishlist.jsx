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
        <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-950 dark:text-white antialiased transition-colors duration-300 w-full pt-10 pb-20">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 min-h-[60vh]">
                <h2 className="text-3xl font-black text-gray-950 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-800 flex items-center gap-3 tracking-tight">
                    <FiHeart className="text-black dark:text-white" />
                    MY WISHLIST
                    {wishlistItems.length > 0 && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-widest bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-full">
                            {wishlistItems.length} {wishlistItems.length !== 1 ? 'ITEMS' : 'ITEM'}
                        </span>
                    )}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1,2,3,4].map(n => (
                            <div key={n} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                        <motion.div
                            animate={{ y: [-10, 0, -10] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <FiHeart className="mx-auto h-20 w-20 text-gray-300 dark:text-gray-700 mb-6" />
                        </motion.div>
                        <h3 className="text-2xl text-gray-950 dark:text-white font-black tracking-tight mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">Save items you love to review them later.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-8 py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition font-bold text-xs uppercase tracking-widest shadow-lg"
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
                                    className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                                >
                                    {/* Product Image */}
                                    <Link to={`/product/${item._id}`} className="block relative overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={optimizeUnsplashUrl(item.images?.[0]?.url || 'https://via.placeholder.com/300', 300)}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleRemove(item._id); }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition shadow"
                                            title="Remove from wishlist"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        {item.discountPrice && item.discountPrice < item.price && (
                                            <span className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                                Sale
                                            </span>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">
                                                {item.category?.name || 'Product'}
                                            </p>
                                            <Link to={`/product/${item._id}`}>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors tracking-tight">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="font-black text-gray-950 dark:text-white tracking-tight">
                                                    {formatCurrency(item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price)}
                                                </span>
                                                {item.discountPrice && item.discountPrice < item.price && (
                                                    <span className="text-[10px] font-bold text-gray-400 line-through">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.stock === 0}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                                            >
                                                <FiShoppingCart className="w-3.5 h-3.5" />
                                                {item.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
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
