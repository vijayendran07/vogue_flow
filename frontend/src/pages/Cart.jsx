import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import { applyCoupon, clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingCart, 
  FiCheck, 
  FiArrowRight, 
  FiTruck, 
  FiShield, 
  FiLock,
  FiTag,
  FiShoppingBag,
  FiArrowLeft
} from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems = [], subTotal = 0, shippingPrice = 0, taxPrice = 0, totalPrice = 0, discountPercentage = 0, error } = useSelector((state) => state.cart);
    const { isAuthenticated = false } = useSelector((state) => state.auth);

    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if(error) {
            toast.error(error);
        }
    }, [error]);

    const handleApplyCoupon = async () => {
        if(!couponCode.trim()) {
            toast.error('Please enter a valid promotional code');
            return;
        }
        setIsApplying(true);
        try {
            const res = await dispatch(applyCoupon(couponCode.trim().toUpperCase()));
            if(!res.error) {
                toast.success("Exclusive Privilege Applied Successfully");
                setCouponCode('');
            }
        } catch (err) {
            toast.error('Privilege code not validated');
        } finally {
            setIsApplying(false);
        }
    };

    const checkoutHandler = () => {
        if(isAuthenticated) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=checkout');
        }
    };

    const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const estimatedDiscount = (subTotal * discountPercentage) / 100;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white antialiased transition-colors duration-300"
        >
            {/* Immersive Top Bar */}
            <div className="border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-28 sm:top-16 z-30">
                <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl flex items-center justify-between">
                    <motion.button
                        variants={buttonVariants}
                        whileHover={{ x: -4 }}
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Continue Selection</span>
                    </motion.button>

                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        <span>Secure Checkout Desk</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
                
                {/* Master Title Statement */}
                <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-1">
                        Curated Requisition
                    </p>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        Review Your Bag
                    </h1>
                </motion.div>

                {!cartItems || cartItems?.length === 0 ? (
                    /* High-End Immersive Empty Suite */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/80 p-12 md:p-24 text-center shadow-sm"
                    >
                        {/* Dynamic aesthetic visual elements */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-100/40 dark:bg-primary-950/20 rounded-full blur-3xl pointer-events-none"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 6, repeat: Infinity }}
                        />

                        <div className="relative z-10 max-w-md mx-auto space-y-6">
                            <motion.div 
                                className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto text-gray-900 dark:text-white"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <FiShoppingBag className="w-8 h-8 stroke-[1.5]" />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    Your Requisition is Empty
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Discover absolute modern utility across our master catalog. Add outstanding items to initiate your personal collection portfolio.
                                </p>
                            </div>

                            <motion.div
                                variants={buttonVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                className="pt-4"
                            >
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full text-sm shadow-lg hover:shadow-xl transition"
                                >
                                    <span>Explore Master Catalog</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        
                        {/* Left Main Bag Listing Container */}
                        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
                            
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {totalItems} {totalItems === 1 ? 'Asset Included' : 'Assets Included'}
                                </span>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        dispatch(clearCart());
                                        toast.info('Requisition list reset successfully');
                                    }}
                                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline tracking-wider uppercase"
                                >
                                    Reset Selection
                                </motion.button>
                            </div>

                            {/* Cart Item Cards Array */}
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {cartItems?.map((item) => (
                                        <CartItem key={item.product} item={item} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            <div className="pt-4 flex justify-between items-center text-xs text-gray-400">
                                <span>Need direct consultation?</span>
                                <span className="font-bold text-gray-900 dark:text-white">Call +1 (800) VOGUE-VIP</span>
                            </div>

                        </motion.div>

                        {/* Right Summary Sidebar Panel */}
                        <motion.div 
                            variants={itemVariants}
                            className="lg:col-span-5 lg:sticky lg:top-32 space-y-6"
                        >
                            {/* Premium Receipt Summary Viewport */}
                            <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/80 space-y-5 sm:space-y-6">
                                
                                <div>
                                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-0.5">
                                        Requisition Metrics
                                    </span>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Summary of Investment
                                    </h3>
                                </div>

                                <div className="space-y-4 text-sm">
                                    {/* Subtotal line */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(subTotal)}
                                        </span>
                                    </div>

                                    {/* Estimated Shipping */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Logistics & Handling</span>
                                        <span className={`font-bold ${shippingPrice === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                            {shippingPrice === 0 ? 'Complimentary' : formatCurrency(shippingPrice)}
                                        </span>
                                    </div>

                                    {/* Luxury Tax */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Jurisdiction Levies</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(taxPrice)}
                                        </span>
                                    </div>

                                    {/* Live Discount Matrix */}
                                    <AnimatePresence>
                                        {discountPercentage > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider"
                                            >
                                                <span>Privilege Applied ({discountPercentage}%)</span>
                                                <span>−{formatCurrency(estimatedDiscount)}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Grand Total Execution block */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700/80 flex justify-between items-baseline">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Total Outlay
                                        </span>
                                        
                                        <motion.span
                                            key={totalPrice}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className="text-3xl font-black text-gray-900 dark:text-white tracking-tight"
                                        >
                                            {formatCurrency(totalPrice)}
                                        </motion.span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code Validation Sub-Desk */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <FiTag className="w-3.5 h-3.5" />
                                    <span>Privilege / Coupon Activation</span>
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. VIPLUXE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-bold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                    />
                                    
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleApplyCoupon}
                                        disabled={isApplying}
                                        className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isApplying ? 'Validating...' : 'Apply'}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Primary Secure Gateway CTA Action */}
                            <div className="space-y-3">
                                <motion.button
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={checkoutHandler}
                                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 sm:gap-3 relative group overflow-hidden text-sm sm:text-base tracking-wide"
                                >
                                    {/* Sweeping dynamic sheen effect */}
                                    <div className="absolute inset-0 w-1/3 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                                    <FiLock className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    <span>Proceed to Secure Checkout</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </motion.button>

                                {/* Authenticity Assurances Matrix */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 flex flex-col items-center text-center">
                                        <FiTruck className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Priority Dispatched</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 flex flex-col items-center text-center">
                                        <FiShield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Vault Encrypted</span>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default Cart;
