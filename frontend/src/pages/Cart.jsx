import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import { applyCoupon, clearCart } from '../redux/slices/cartSlice';
import { openAuthModal } from '../redux/slices/authSlice';
import api from '../services/api';
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
  FiArrowLeft,
  FiHeadphones
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
    const [availableCoupons, setAvailableCoupons] = useState([]);

    useEffect(() => {
        if(error) {
            toast.error(error);
        }
    }, [error]);

    const fetchActiveCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            if (data?.success) {
                setAvailableCoupons(data.coupons || []);
            }
        } catch (err) {
            setAvailableCoupons([]);
        }
    };

    useEffect(() => {
        fetchActiveCoupons();

        const refreshCoupons = () => fetchActiveCoupons();
        window.addEventListener('focus', refreshCoupons);
        document.addEventListener('visibilitychange', refreshCoupons);

        return () => {
            window.removeEventListener('focus', refreshCoupons);
            document.removeEventListener('visibilitychange', refreshCoupons);
        };
    }, []);

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
            dispatch(openAuthModal('login'));
        }
    };

    const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const estimatedDiscount = (subTotal * discountPercentage) / 100;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-950 dark:text-white antialiased transition-colors duration-300 w-full"
        >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12">
                <div className="mb-6">
                    <motion.button
                        variants={buttonVariants}
                        whileHover={{ x: -4 }}
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition tracking-wide"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span>Back to Shopping</span>
                    </motion.button>
                </div>
                
                {!cartItems || cartItems?.length === 0 ? (
                    <>
                        {/* Master Title Statement */}
                        <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                                Curated Requisition
                            </p>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-none">
                                Review Your Bag
                            </h1>
                        </motion.div>
                        {/* High-End Immersive Empty Suite */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-12 md:p-24 text-center shadow-sm"
                        >
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 6, repeat: Infinity }}
                            />

                            <div className="relative z-10 max-w-md mx-auto space-y-6">
                                <motion.div 
                                    className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mx-auto text-gray-400 dark:text-gray-500 shadow-sm"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <FiShoppingBag className="w-8 h-8 stroke-[1.5]" />
                                </motion.div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                                        Your Requisition is Empty
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
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
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white dark:bg-white dark:text-black font-bold rounded-full text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition"
                                    >
                                        <span>Explore Master Catalog</span>
                                        <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* Left Main Bag Listing Container */}
                        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
                            
                            {/* Master Title Statement */}
                            <div className="mb-8 lg:mb-10">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                                    CURATED REQUISITION
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-none">
                                    Review Your Bag
                                </h1>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {totalItems} {totalItems === 1 ? 'ITEM IN YOUR BAG' : 'ITEMS IN YOUR BAG'}
                                </span>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        dispatch(clearCart());
                                        toast.info('Requisition list reset successfully');
                                    }}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:underline tracking-wider uppercase transition"
                                >
                                    RESET SELECTION
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

                            
                            
                            {/* Proceed to Payment Button */}
                            <div className="pt-2">
                                <motion.button
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={checkoutHandler}
                                    disabled={cartItems.length === 0}
                                    className="w-full h-14 bg-black text-white dark:bg-white dark:text-black font-bold tracking-widest text-xs uppercase rounded-2xl flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 w-1/3 h-full bg-white/20 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                                    <FiLock className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    <span>PROCEED TO PAYMENT</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>

                        </motion.div>

                        {/* Right Summary Sidebar Panel */}
                        <motion.div 
                            variants={itemVariants}
                            className="lg:col-span-5 lg:sticky lg:top-32 space-y-6"
                        >
                            {/* Premium Receipt Summary Viewport */}
                            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
                                
                                <div>
                                    <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight">
                                        Order Summary
                                    </h3>
                                </div>

                                <div className="space-y-4 text-sm">
                                    {/* Subtotal line */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-950 dark:text-white">
                                            {formatCurrency(subTotal)}
                                        </span>
                                    </div>

                                    {/* Estimated Shipping */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Logistics & Handling</span>
                                        <span className={`font-bold ${shippingPrice === 0 ? 'text-gray-950 dark:text-white font-black' : 'text-gray-950 dark:text-white'}`}>
                                            {shippingPrice === 0 ? 'Complimentary' : formatCurrency(shippingPrice)}
                                        </span>
                                    </div>

                                    {/* Luxury Tax */}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>GST (5%)</span>
                                        <span className="font-bold text-gray-950 dark:text-white">
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
                                                className="flex justify-between items-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-bold text-xs uppercase tracking-wider"
                                            >
                                                <span>Privilege Applied ({discountPercentage}%)</span>
                                                <span>−{formatCurrency(estimatedDiscount)}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Grand Total Execution block */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            TO PAY
                                        </span>
                                        
                                        <motion.span
                                            key={totalPrice}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className="text-3xl font-black text-gray-950 dark:text-white tracking-tight"
                                        >
                                            {formatCurrency(totalPrice)}
                                        </motion.span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code Validation Sub-Desk */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
                                <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                                <span>Apply Coupon</span>
                                </h3>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white text-sm font-bold placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition"
                                    />
                                    
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleApplyCoupon}
                                        disabled={isApplying}
                                        className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isApplying ? 'Validating...' : 'APPLY'}
                                    </motion.button>
                                </div>

                                {availableCoupons.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">AVAILABLE CODES</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCoupons.slice(0, 5).map((coupon) => (
                                                <button
                                                    key={coupon._id}
                                                    type="button"
                                                    onClick={async () => {
                                                        setCouponCode(coupon.code);
                                                        const res = await dispatch(applyCoupon(coupon.code));
                                                        if (!res.error) {
                                                            toast.success(`Applied ${coupon.code}`);
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs font-bold tracking-wide text-gray-600 dark:text-gray-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition"
                                                >
                                                    {coupon.code} ({coupon.discountPercentage}%)
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                          

                        </motion.div>
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default Cart;
