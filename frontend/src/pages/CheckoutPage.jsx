import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { createOrder, clearErrors } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTruck, 
  FiCreditCard, 
  FiCheckCircle, 
  FiArrowRight, 
  FiArrowLeft, 
  FiShield, 
  FiLock, 
  FiCheck,
  FiUser,
  FiMapPin,
  FiFileText
} from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { cartItems, subTotal, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { loading, error } = useSelector((state) => state.order);

    const [currentStep, setCurrentStep] = useState(1); // 1: Delivery, 2: Payment, 3: Review
    const orderPlaced = useRef(false);

    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        state: '',
        country: 'India',
        pinCode: '',
        phoneNo: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [subPaymentMethod, setSubPaymentMethod] = useState('');

    const [loadingIntent, setLoadingIntent] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                return resolve(true);
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const initiateRazorpayPayment = async () => {
        setLoadingIntent(true);
        
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            setLoadingIntent(false);
            return toast.error("Razorpay SDK failed to load. Are you online?");
        }

        let finalPaymentMethod = paymentMethod;
        if (paymentMethod === 'UPI') {
            finalPaymentMethod = `UPI - ${subPaymentMethod}`;
        } else if (paymentMethod === 'Net Banking') {
            finalPaymentMethod = `Net Banking - ${subPaymentMethod}`;
        }

        const orderData = {
            shippingInfo: {
                ...shippingInfo,
                name: user?.name || 'VogueFlow Customer',
                email: user?.email || 'customer@vagueflow.com'
            },
            billingInfo: {
                ...shippingInfo,
                name: user?.name || 'VogueFlow Customer',
                email: user?.email || 'customer@vagueflow.com'
            },
            orderItems: cartItems,
            paymentMethod: finalPaymentMethod,
            itemsPrice: subTotal,
            taxPrice,
            shippingPrice,
            totalPrice
        };

        try {
            const { data } = await api.post('/payment/razorpay/order', orderData);
            
            if (data.success) {
                const options = {
                    key: data.razorpayKeyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: "VagueFlow",
                    description: "Secure Checkout Payment",
                    order_id: data.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            const verifyData = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: data.orderId
                            };
                            
                            const verifyRes = await api.post('/payment/razorpay/verify', verifyData);
                            
                            if (verifyRes.data.success) {
                                orderPlaced.current = true;
                                dispatch(clearCart());
                                toast.success("Payment verified successfully!");
                                navigate(`/order-success?order_id=${data.orderId}`);
                            }
                        } catch (err) {
                            console.error("Verification error", err);
                            toast.error(err.response?.data?.message || "Payment verification failed.");
                        }
                    },
                    prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                        contact: shippingInfo.phoneNo || ''
                    },
                    theme: {
                        color: "#0f172a"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error(response.error.description || "Payment failed.");
                });
                rzp.open();
            }
        } catch (err) {
            console.error("Razorpay Order initiation failed", err);
            toast.error(err.response?.data?.message || 'Payment initiation failed. Please try again.');
        } finally {
            setLoadingIntent(false);
        }
    };

    useEffect(() => {
        if (!orderPlaced.current && (!cartItems || cartItems?.length === 0)) {
            navigate('/cart');
            toast.error("Requisition bag is empty. Please select valid target assets.");
        }

        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
    }, [cartItems.length, navigate, error, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo({ ...shippingInfo, [name]: value });
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNo) {
                return toast.error('Please supply complete delivery address details to proceed');
            }
            if (shippingInfo.phoneNo.length < 10) {
                return toast.error('Please input a fully-qualified 10-digit phone identifier');
            }
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentStep === 2) {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();

        // Standard validation safety check
        if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNo) {
            return toast.error('Please fill in all required delivery fields');
        }
        if (shippingInfo.phoneNo.length < 10) {
            return toast.error('Please enter a valid 10-digit phone number');
        }

        let finalPaymentMethod = paymentMethod;
        if (paymentMethod === 'UPI') {
            if (!subPaymentMethod) return toast.error('Please select a UPI provider');
            finalPaymentMethod = `UPI - ${subPaymentMethod}`;
        } else if (paymentMethod === 'Net Banking') {
            if (!subPaymentMethod) return toast.error('Please select a Bank');
            finalPaymentMethod = `Net Banking - ${subPaymentMethod}`;
        }

        const orderData = {
            shippingInfo: {
                ...shippingInfo,
                name: user?.name || 'VogueFlow Customer',
                email: user?.email || 'customer@vagueflow.com'
            },
            billingInfo: {
                ...shippingInfo,
                name: user?.name || 'VogueFlow Customer',
                email: user?.email || 'customer@vagueflow.com'
            },
            orderItems: cartItems,
            paymentMethod: finalPaymentMethod,
            paymentStatus: 'Pending',
            itemsPrice: subTotal,
            taxPrice,
            shippingPrice,
            totalPrice
        };

        // Razorpay Order Creation and Checkout
        if (paymentMethod === 'Online Payment (Razorpay)') {
            try {
                // Store pending order locally for verification after payment
                localStorage.setItem('pendingOrder', JSON.stringify(orderData));

                // Call backend to create Razorpay order
                const { data } = await api.post('/payment/razorpay/order', orderData);

                if (data.success && data.razorpayOrderId) {
                    // Prepare Razorpay checkout options (reuse existing options logic)
                    const options = {
                        key: data.razorpayKeyId,
                        amount: data.amount,
                        currency: data.currency,
                        name: user?.name || 'VogueFlow Customer',
                        description: 'Order Payment',
                        order_id: data.razorpayOrderId,
                        handler: async (response) => {
                            // Verify payment on backend
                            try {
                                const verifyRes = await api.post('/payment/razorpay/verify', {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.orderId
                                });
                                if (verifyRes.data.success) {
                                    orderPlaced.current = true;
                                    dispatch(clearCart());
                                    toast.success('Payment verified successfully!');
                                    navigate(`/order-success?order_id=${data.orderId}`);
                                } else {
                                    toast.error('Payment verification failed.');
                                }
                            } catch (verr) {
                                console.error('Verification error', verr);
                                toast.error(verr.response?.data?.message || 'Verification failed.');
                            }
                        },
                        prefill: {
                            name: user?.name || '',
                            email: user?.email || '',
                            contact: shippingInfo.phoneNo || ''
                        },
                        theme: { color: '#0f172a' }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', function (response) { toast.error(response.error.description || 'Payment failed.'); });
                    rzp.open();
                } else {
                    toast.error('Failed to initiate Razorpay payment.');
                }
            } catch (err) {
                console.error('Razorpay order initiation error', err);
                toast.error(err.response?.data?.message || 'Payment initiation failed. Please try again.');
            }
        } else if (paymentMethod === 'UPI' || paymentMethod === 'Net Banking') {
            // For UPI/Net Banking, fallback to existing Razorpay flow (same as above) – reuse the same block if needed.
            // This placeholder can be expanded as per business logic.
        } else {
            const resultAction = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(resultAction)) {
                orderPlaced.current = true;
                dispatch(clearCart());
                navigate('/order-success');
            } else {
                toast.error(resultAction.payload || 'Failed to place order. Please try again.');
            }
        }
    };

    if (!cartItems || cartItems?.length === 0) return null;

    const steps = [
        { num: 1, title: 'Logistics', subtitle: 'Destination Metrics', icon: FiTruck },
        { num: 2, title: 'Vault Gate', subtitle: 'Payment Provision', icon: FiCreditCard },
        { num: 3, title: 'Authorization', subtitle: 'Final Verification', icon: FiFileText }
    ];

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white antialiased transition-colors duration-300 pb-20"
        >
            {/* Immersive Navigation Bar */}
            <div className="border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-28 sm:top-16 z-30">
                <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl flex items-center justify-between">
                    <motion.button
                        variants={buttonVariants}
                        whileHover={{ x: -4 }}
                        onClick={() => currentStep > 1 ? handlePrevStep() : navigate('/cart')}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{currentStep > 1 ? 'Previous Phase' : 'Modify Requisition'}</span>
                    </motion.button>

                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
                        <FiLock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 inline" />
                        <span>256-Bit Encrypted Link</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
                
                {/* Advanced Multi-Step Progress Ribbon Tracker */}
                <div className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16 overflow-x-auto">
                    <div className="relative flex justify-between items-center">
                        
                        {/* Connecting background progress track */}
                        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
                        
                        {/* Active filling progress bar */}
                        <motion.div 
                            className="absolute top-6 left-0 h-0.5 bg-gray-900 dark:bg-white -z-10"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />

                        {steps.map((st) => {
                            const IconComponent = st.icon;
                            const isCompleted = currentStep > st.num;
                            const isCurrent = currentStep === st.num;
                            
                            return (
                                <div key={st.num} className="flex flex-col items-center group select-none">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative bg-white dark:bg-gray-900 ${
                                            isCompleted || isCurrent 
                                                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white shadow-md' 
                                                : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <FiCheck className="w-5 h-5 text-gray-900 dark:text-white stroke-[3]" />
                                        ) : (
                                            <IconComponent className={`w-5 h-5 ${isCurrent ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                                        )}

                                        {isCurrent && (
                                            <motion.div 
                                                layoutId="activeStepRing"
                                                className="absolute -inset-1.5 rounded-full border border-gray-900 dark:border-white opacity-20"
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            />
                                        )}
                                    </motion.div>

                                    <div className="text-center mt-3 hidden sm:block">
                                        <span className={`text-xs font-black uppercase tracking-wider block ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {st.title}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold block">
                                            {st.subtitle}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Primary Dual Viewport Strategy Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* Left Form Viewport Container */}
                    <div className="lg:col-span-7 space-y-8">
                        <AnimatePresence mode="wait">
                            
                            {/* STEP 1: Logistics & Identity Delivery Details */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-0.5">
                                            Milestone 1 of 3
                                        </span>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            Destination Logistics
                                        </h2>
                                    </div>

                                    <div className="p-6 sm:p-8 rounded-3xl bg-gray-50/60 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 space-y-6">
                                        
                                        {/* Authenticated Patron Badge */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Patron Signature Identity
                                            </label>
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60">
                                                <FiUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white flex-1 line-clamp-1">
                                                    {user?.name || 'Authenticated Master User'}
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                                    Verified Link
                                                </span>
                                            </div>
                                        </div>

                                        {/* Master Delivery Form Array */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                    Street Target Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={shippingInfo.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Apt, Corporate Complex, Street Line"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={shippingInfo.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Mumbai"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        State / Province *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={shippingInfo.state}
                                                        onChange={handleInputChange}
                                                        placeholder="Maharashtra"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        Postal Index Code *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="pinCode"
                                                        value={shippingInfo.pinCode}
                                                        onChange={handleInputChange}
                                                        placeholder="400001"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        Mobile Identifier *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="phoneNo"
                                                        value={shippingInfo.phoneNo}
                                                        onChange={handleInputChange}
                                                        placeholder="9876543210"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                    Jurisdiction Boundary
                                                </label>
                                                <select
                                                    name="country"
                                                    value={shippingInfo.country}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-gray-900 dark:focus:border-white transition"
                                                >
                                                    <option value="India">India (Primary Domain)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action execution */}
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleNextStep}
                                            className="w-full h-12 sm:h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2"
                                    >
                                        <span>Confirm Logistics Protocol</span>
                                        <FiArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2: Secure Vault Payment Selector */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-0.5">
                                            Milestone 2 of 3
                                        </span>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            Vault Security Provision
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Primary Active Tier: COD */}
                                        <label className={`block p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${
                                            paymentMethod === 'COD' 
                                                ? 'bg-primary-50/30 dark:bg-primary-950/10 border-gray-900 dark:border-white shadow-md' 
                                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100'
                                        }`}>
                                            <div className="flex items-start gap-4">
                                                <input 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    value="COD" 
                                                    checked={paymentMethod === 'COD'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="mt-1 w-4 h-4 accent-gray-900 dark:accent-white"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                                            Cash on Delivery (COD Desk)
                                                        </span>
                                                        <FiCheckCircle className={`w-5 h-5 ${paymentMethod === 'COD' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        Settle investment liabilities upon physical transfer of assets at destination parameter. Fully insured against local jurisdiction handling contingencies.
                                                    </p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Enabled Tier: Razorpay */}
                                        <label className={`block p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${
                                            paymentMethod === 'Online Payment (Razorpay)' 
                                                ? 'bg-primary-50/30 dark:bg-primary-950/10 border-gray-900 dark:border-white shadow-md' 
                                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100'
                                        }`}>
                                            <div className="flex items-start gap-4">
                                                <input 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    value="Online Payment (Razorpay)" 
                                                    checked={paymentMethod === 'Online Payment (Razorpay)'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="mt-1 w-4 h-4 accent-gray-900 dark:accent-white"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                                            Online Payment (Razorpay)
                                                        </span>
                                                        <FiCheckCircle className={`w-5 h-5 ${paymentMethod === 'Online Payment (Razorpay)' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        Instant secure multi-tier bank node execution interface via Razorpay.
                                                    </p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* UPI Options */}
                                        <label className={`block p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${
                                            paymentMethod === 'UPI' 
                                                ? 'bg-primary-50/30 dark:bg-primary-950/10 border-gray-900 dark:border-white shadow-md' 
                                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100'
                                        }`}>
                                            <div className="flex items-start gap-4">
                                                <input 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    value="UPI" 
                                                    checked={paymentMethod === 'UPI'}
                                                    onChange={(e) => { setPaymentMethod(e.target.value); setSubPaymentMethod(''); }}
                                                    className="mt-1 w-4 h-4 accent-gray-900 dark:accent-white"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                                            UPI (Unified Payments Interface)
                                                        </span>
                                                        <FiCheckCircle className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        Pay instantly using your preferred UPI app.
                                                    </p>
                                                    
                                                    {paymentMethod === 'UPI' && (
                                                        <div className="mt-4 flex flex-col gap-2">
                                                            {['GPay', 'PhonePe', 'Paytm'].map(provider => (
                                                                <label key={provider} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                                                                    <input 
                                                                        type="radio" 
                                                                        name="subPaymentMethod" 
                                                                        value={provider} 
                                                                        checked={subPaymentMethod === provider}
                                                                        onChange={(e) => setSubPaymentMethod(e.target.value)}
                                                                        className="w-3.5 h-3.5 accent-gray-900 dark:accent-white"
                                                                    />
                                                                    <span>{provider}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </label>

                                        {/* Net Banking Options */}
                                        <label className={`block p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${
                                            paymentMethod === 'Net Banking' 
                                                ? 'bg-primary-50/30 dark:bg-primary-950/10 border-gray-900 dark:border-white shadow-md' 
                                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100'
                                        }`}>
                                            <div className="flex items-start gap-4">
                                                <input 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    value="Net Banking" 
                                                    checked={paymentMethod === 'Net Banking'}
                                                    onChange={(e) => { setPaymentMethod(e.target.value); setSubPaymentMethod(''); }}
                                                    className="mt-1 w-4 h-4 accent-gray-900 dark:accent-white"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                                            Net Banking
                                                        </span>
                                                        <FiCheckCircle className={`w-5 h-5 ${paymentMethod === 'Net Banking' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        Direct bank transfer from supported major banks.
                                                    </p>
                                                    
                                                    {paymentMethod === 'Net Banking' && (
                                                        <div className="mt-4 flex flex-col gap-2">
                                                            {['SBI', 'HDFC', 'Indian Bank'].map(provider => (
                                                                <label key={provider} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                                                                    <input 
                                                                        type="radio" 
                                                                        name="subPaymentMethod" 
                                                                        value={provider} 
                                                                        checked={subPaymentMethod === provider}
                                                                        onChange={(e) => setSubPaymentMethod(e.target.value)}
                                                                        className="w-3.5 h-3.5 accent-gray-900 dark:accent-white"
                                                                    />
                                                                    <span>{provider}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handlePrevStep}
                                            className="w-1/3 h-14 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                                        >
                                            Back
                                        </motion.button>
                                        
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={handleNextStep}
                                            className="flex-1 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2"
                                        >
                                            <span>Authorize Payment Mode</span>
                                            <FiArrowRight className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Final Requisition Authorization Verification */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-0.5">
                                            Milestone 3 of 3
                                        </span>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            Final Authority Endorsement
                                        </h2>
                                    </div>

                                    {/* Consolidated Validation Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        
                                        {/* Target Summary Snapshot Card */}
                                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Logistics Pipeline
                                                </span>
                                                <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                                    Edit
                                                </button>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                                {shippingInfo.address}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pinCode}
                                            </p>
                                            <p className="text-xs font-mono text-gray-400 pt-1">
                                                Tel: {shippingInfo.phoneNo}
                                            </p>
                                        </div>

                                        {/* Payment Status Profile Snapshot */}
                                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Payment Gateway Status
                                                </span>
                                                <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <FiCreditCard className="w-4 h-4 text-gray-900 dark:text-white" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {paymentMethod}{paymentMethod === 'UPI' || paymentMethod === 'Net Banking' ? (subPaymentMethod ? ` - ${subPaymentMethod}` : '') : ''} Allocation
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Escrow condition: Upon fulfillment
                                            </p>
                                        </div>
                                    </div>

                                    {/* Final Execution Policy Assurances */}
                                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed space-y-1">
                                        <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <FiShield className="w-3.5 h-3.5" />
                                            <span>Secure Execution Warranty</span>
                                        </div>
                                        <p className="text-[11px] opacity-80">
                                            By submitting this action, you authorize VogueFlow systems to prepare delivery parameters under high-end quality inspection standards.
                                        </p>
                                    </div>

                                    {/* Action Array */}
                                    <div className="pt-4">
                                        {paymentMethod === 'COD' ? (
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handlePrevStep}
                                                    disabled={loading}
                                                    className="w-full sm:w-1/3 h-12 sm:h-14 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-30"
                                                >
                                                    Back
                                                </motion.button>

                                                <motion.button
                                                    variants={buttonVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={placeOrderHandler}
                                                    disabled={loading}
                                                    className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative group overflow-hidden"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Securing Requisition...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="absolute inset-0 w-1/2 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                                                            <FiLock className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                            <span>Complete Secure Order</span>
                                                            <FiArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        ) : (
                                             <div className="space-y-6">
                                                 <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                     <motion.button
                                                         whileHover={{ scale: 1.02 }}
                                                         whileTap={{ scale: 0.98 }}
                                                         onClick={handlePrevStep}
                                                         disabled={loadingIntent}
                                                         className="w-full sm:w-1/3 h-12 sm:h-14 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-30"
                                                     >
                                                         Back
                                                     </motion.button>

                                                     <motion.button
                                                         variants={buttonVariants}
                                                         whileHover="hover"
                                                         whileTap="tap"
                                                         onClick={initiateRazorpayPayment}
                                                         disabled={loadingIntent}
                                                         className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative group overflow-hidden"
                                                     >
                                                         {loadingIntent ? (
                                                             <>
                                                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                 </svg>
                                                                 <span>Contacting Gateway...</span>
                                                             </>
                                                         ) : (
                                                             <>
                                                                 <div className="absolute inset-0 w-1/2 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                                                                 <FiLock className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                                 <span>Pay with Razorpay</span>
                                                                 <FiArrowRight className="w-4 h-4" />
                                                             </>
                                                         )}
                                                     </motion.button>
                                                 </div>
                                             </div>
                                         )}
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Right Summary Live Sidebar Viewport */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-5 lg:sticky lg:top-32 space-y-6"
                    >
                        {/* Branded Floating Investment Card */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/80 space-y-5 sm:space-y-6">
                            
                            <div>
                                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-0.5">
                                    Requisition Contents
                                </span>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Investment Statement
                                </h3>
                            </div>

                            {/* Consolidated item previews array */}
                            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar pb-2">
                                {cartItems?.map((item) => (
                                    <div key={item.product} className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-semibold">
                                                Qty: {item.quantity} • {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                        <span className="text-xs font-black text-gray-900 dark:text-white">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing layers matrix */}
                            <div className="space-y-3 pt-4 border-t border-gray-200/80 dark:border-gray-700/80 text-sm">
                                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(subTotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>Delivery Allocation</span>
                                    <span className={`font-bold ${shippingPrice === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                        {shippingPrice === 0 ? 'Complimentary' : formatCurrency(shippingPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>GST Levies</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(taxPrice)}
                                    </span>
                                </div>

                                {/* Consolidated Output Execution */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700/80 flex justify-between items-baseline">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                                            Final Execution Outlay
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-medium">
                                            All international fees resolved
                                        </span>
                                    </div>

                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {formatCurrency(totalPrice)}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Minimalist Return Help Segment */}
                        <div className="text-center">
                            <Link to="/cart" className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition underline block">
                                Return to primary basket overview
                            </Link>
                        </div>

                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
};

export default CheckoutPage;
