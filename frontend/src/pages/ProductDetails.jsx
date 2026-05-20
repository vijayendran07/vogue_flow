import React, { useEffect, useState, useRef } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails, clearErrors, getProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { useParams, useNavigate } from 'react-router-dom';
import Rating from '../components/common/Rating';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  FiAlertCircle, 
  FiShoppingCart, 
  FiHeart, 
  FiTruck, 
  FiShield, 
  FiArrowLeft, 
  FiArrowRight, 
  FiCheck, 
  FiAward, 
  FiRotateCcw,
  FiMaximize2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: '50%', y: '50%' });
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Interactive Mock Selectors for Premium Customisation
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Classic Black');
  const [activeTab, setActiveTab] = useState('description');

  const imageContainerRef = useRef(null);

  const { product = {}, products = [], loading, error } = useSelector((state) => state.products);
  const productImages = product?.images ?? [];

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
      // Reset local states on product change
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [dispatch, id]);

  // Fetch related products
  useEffect(() => {
    if (product?.category) {
      dispatch(getProducts({ category: product.category, currentPage: 1 })).then((res) => {
        if (res.payload?.products) {
          const filtered = res.payload?.products.filter((p) => p._id !== product._id).slice(0, 6);
          setRelatedProducts(filtered);
        }
      });
    }
  }, [product?.category, product?._id, dispatch]);

  const increaseQuantity = () => {
    if (product?.stock <= quantity) return;
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (1 >= quantity) return;
    setQuantity(quantity - 1);
  };

  const addToCartHandler = () => {
    if (!product?._id) {
      toast.error('Product not available');
      return;
    }
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price,
      image: product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/600',
      stock: product.stock,
      quantity
    }));
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your bag`);
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x: `${x}%`, y: `${y}%` });
    setZoomLevel(1.6);
  };

  const handleMouseLeave = () => {
    setZoomLevel(1);
  };

  // Mock luxury item specifics
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Classic Black', hex: '#111827' },
    { name: 'Pure White', hex: '#F9FAFB' },
    { name: 'Midnight Blue', hex: '#1E3A8A' },
    { name: 'Slate Gray', hex: '#4B5563' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.97 }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
            <div className="lg:col-span-7">
              <Skeleton height={650} className="rounded-3xl dark:opacity-20" />
              <div className="flex gap-4 mt-4">
                {[1, 2, 3, 4].map(n => <Skeleton key={n} width={100} height={100} className="rounded-2xl dark:opacity-20" />)}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Skeleton height={30} width="40%" className="dark:opacity-20" />
              <Skeleton height={60} width="90%" className="dark:opacity-20" />
              <Skeleton height={40} width="60%" className="dark:opacity-20" />
              <Skeleton height={150} className="dark:opacity-20" />
              <Skeleton height={80} className="dark:opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product?._id) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[80vh] bg-white dark:bg-gray-900"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mb-6"
          >
            <FiAlertCircle className="h-20 w-20 text-red-500 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Product Unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {error ? error : 'The requested item could not be found or is no longer listed in our premium catalogue.'}
          </p>
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/products')}
            className="w-full px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-xl hover:shadow-2xl transition"
          >
            Return to Collection
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const discountPercentage = product?.discountPrice && product?.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentActivePrice = product?.discountPrice && product.discountPrice < product.price 
    ? product.discountPrice 
    : product?.price;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white antialiased transition-colors duration-300"
    >
      {/* Immersive Category Breadcrumb Bar */}
      <div className="border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-28 sm:top-16 z-30 transition-colors">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl flex items-center justify-between">
          <motion.button
            variants={buttonVariants}
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Catalogue</span>
          </motion.button>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            <span>{product?.category?.name || 'Exclusive Collection'}</span>
            <span>•</span>
            <span className="text-primary-600 dark:text-primary-400">Premium</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Immersive Gallery Suite */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            
            {/* Primary Main Interactive Viewport */}
            <div 
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 aspect-[4/5] md:aspect-square flex items-center justify-center cursor-crosshair shadow-sm group"
            >
              {/* Product Badges Overlay */}
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
                {discountPercentage > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-1.5 bg-red-600 text-white text-xs font-black tracking-wider uppercase rounded-full shadow-lg backdrop-blur-md"
                  >
                    Save {discountPercentage}%
                  </motion.span>
                )}
                <span className="px-4 py-1.5 bg-gray-900/80 dark:bg-white/90 text-white dark:text-gray-900 text-xs font-bold tracking-widest uppercase rounded-full backdrop-blur-md w-fit">
                  Luxury Edit
                </span>
              </div>

              {/* Action Hint Overlay */}
              <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2.5 rounded-full shadow-md text-gray-700 dark:text-gray-300">
                <FiMaximize2 className="w-4 h-4 animate-pulse" />
              </div>

              {/* Main Rendered High-Res Asset */}
              <motion.div 
                className="w-full h-full flex items-center justify-center transition-all duration-200"
                style={{
                  transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}`,
                  scale: zoomLevel
                }}
              >
                <img
                  key={selectedImage}
                  src={product?.images?.[selectedImage]?.url || 'https://via.placeholder.com/800'}
                  alt={product?.name}
                  className="w-full h-full object-contain max-h-[85%] select-none p-8 transition-opacity duration-300"
                />
              </motion.div>

              {/* Internal Asset Index Bar */}
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2">
                  {productImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedImage === i ? 'bg-gray-900 dark:bg-white w-4' : 'bg-gray-400 dark:bg-gray-600'}`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Selection Desk Suite */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {productImages.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-300 bg-gray-50 dark:bg-gray-800 ${
                      selectedImage === idx 
                        ? 'border-gray-900 dark:border-white shadow-md scale-105 z-10' 
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                    {selectedImage === idx && (
                      <div className="absolute inset-0 bg-gray-900/5 dark:bg-white/5" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Premium Sticky Specification Suite */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 lg:sticky lg:top-32 space-y-8"
          >
            {/* Storytelling Header Block */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase">
                VogueFlow Signature Series
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                {product?.name}
              </h1>
              
              {/* Reviews Overview Snippet */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                  <Rating value={product?.ratings || 0} />
                  <span className="text-xs font-bold ml-1 text-gray-900 dark:text-white">
                    {product?.ratings ? Number(product.ratings).toFixed(1) : 'New'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {product?.numOfReviews || 0} Verified Reviews
                </span>
                
                <span className="text-gray-300 dark:text-gray-700">•</span>
                
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                  SKU: {product?._id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Premium Pricing Tier */}
            <div className="p-6 rounded-3xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/80 space-y-2">
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Investment Value
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  {formatCurrency(currentActivePrice)}
                </span>
                
                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl sm:text-2xl font-bold text-gray-400 dark:text-gray-600 line-through">
                      {formatCurrency(product?.price)}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/50 dark:border-emerald-800/40 ml-auto">
                      Save {formatCurrency(product.price - currentActivePrice)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Inclusive of all multi-jurisdiction luxury taxes. Authenticity officially certified.
              </p>
            </div>

            {/* Modern Size Selector Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Select Size: <span className="text-gray-900 dark:text-white font-extrabold">{selectedSize}</span>
                </label>
                <button className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                  Size Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {sizes.map((sz) => (
                  <motion.button
                    key={sz}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-12 min-w-12 px-4 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 border ${
                      selectedSize === sz
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {sz}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Modern Colour Customisation Interface */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Finish / Shade: <span className="text-gray-900 dark:text-white font-extrabold">{selectedColor}</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {colors.map((c) => (
                  <motion.button
                    key={c.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative ${
                      selectedColor === c.name 
                        ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-900 scale-105' 
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && (
                      <FiCheck className={`w-4 h-4 ${c.name === 'Pure White' ? 'text-gray-900' : 'text-white'}`} />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Elegant Real-Time Stock Status */}
            <div className="space-y-3 pt-2">
              <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                product?.stock > 0 
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${product?.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <div className="text-xs font-bold uppercase tracking-wider">
                  {product?.stock > 0 ? `In Stock • Ready to dispatch` : 'Out of Stock'}
                </div>
                {product?.stock > 0 && (
                  <div className="ml-auto text-xs font-extrabold opacity-80">
                    {product.stock} Units Left
                  </div>
                )}
              </div>
            </div>

            {/* Premium Quantity & Instant CTA Array */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                
                {/* Advanced Counter Interface */}
                <div className="h-12 sm:h-14 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center p-1 w-full sm:w-36 select-none">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={decreaseQuantity}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    −
                  </motion.button>
                  <span className="flex-1 text-center font-black text-lg text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={increaseQuantity}
                    disabled={product?.stock <= quantity}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-30"
                  >
                    +
                  </motion.button>
                </div>

                {/* Primary Animated Bag Interaction */}
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={product?.stock < 1}
                  onClick={addToCartHandler}
                  className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative group"
                >
                  {/* Sweep highlight effect */}
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                  <FiShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Add to Bag</span>
                </motion.button>
              </div>

              {/* Instant Buy Express Trigger */}
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                disabled={product?.stock < 1}
                onClick={() => {
                  addToCartHandler();
                  navigate('/checkout');
                }}
                className="w-full h-12 sm:h-14 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Instant Buy Now
              </motion.button>
            </div>

            {/* Apple Style Minimalist Value Proposition Accordion Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400 mb-2.5" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">Complimentary Delivery</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">Dispatched within 24h</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <FiShield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2.5" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">Secure Encrypted</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">256-bit SSL Vault</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <FiRotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2.5" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">Seamless Exchange</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">30-day effortless return</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Storytelling Product Deep Dive Tabs Matrix */}
      <div className="border-y border-gray-100 dark:border-gray-800 mt-12 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-start sm:justify-center gap-4 sm:gap-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap">
            {[
              { id: 'description', label: 'Product Deep Dive' },
              { id: 'specifications', label: 'Design & Build Specs' },
              { id: 'care', label: 'Care & Maintenance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 text-sm font-bold tracking-wider uppercase relative transition-colors ${
                  activeTab === tab.id 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="py-12 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg text-center font-serif sm:font-sans"
                >
                  <p className="font-medium text-gray-900 dark:text-white text-xl">
                    "{product?.description || 'Engineered with absolute precision to match state-of-the-art visual expectations.'}"
                  </p>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    Experience modern utility perfectly synchronized with iconic aesthetics. Every angle, seam, and contour has been crafted under strict quality parameters to provide optimal durability alongside effortless daily statement-making style.
                  </p>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
                >
                  {[
                    { label: 'Origin Component', value: 'Imported Premium Grade' },
                    { label: 'Manufacturer Code', value: `VOGUE-${product?._id?.slice(-4).toUpperCase()}` },
                    { label: 'Sustainability Index', value: 'Tier 1 Certified Recycled Elements' },
                    { label: 'Authenticity Guarantee', value: 'Physical Micro-Chip Tracked' },
                    { label: 'Weight Category', value: 'Ultra-lightweight Optimized' },
                    { label: 'Warranty Scope', value: '1 Year Full International Coverage' }
                  ].map((spec, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{spec.label}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'care' && (
                <motion.div
                  key="care"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 max-w-xl mx-auto text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2">
                    <FiAward className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Expert Product Care Parameters</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    To maintain the optimal sheen and structural integrity of your product over extended ownership lifecycles, keep away from prolonged direct thermal sources. Clean gently using a microfiber application dampened with pure water. Avoid harsh industrial chemical solvents.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modern High-End Reviews Framework */}
      <div className="container mx-auto px-4 py-16 lg:py-24 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Owner Voices
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
              Real world feedback gathered from authenticated community patrons
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-4xl font-black text-gray-900 dark:text-white">
              {product?.ratings ? Number(product.ratings).toFixed(1) : '5.0'}
            </span>
            <div>
              <Rating value={product?.ratings || 5} />
              <p className="text-xs text-gray-400 font-semibold pt-0.5">
                Based on {product?.numOfReviews || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {product?.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.reviews.map((rev, idx) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{rev.name}</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        Verified Buyer
                      </span>
                    </div>
                    <Rating value={rev.rating} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                
                <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-400">
                  <span>Helpful validation?</span>
                  <button className="font-bold text-gray-900 dark:text-white hover:underline">
                    Yes (0)
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">Be the first to curate your experience</p>
            <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-bold shadow hover:scale-105 transition">
              Draft a Review
            </button>
          </div>
        )}
      </div>

      {/* Premium Related Assets Slider */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 py-16 lg:py-24 bg-gray-50/30 dark:bg-gray-900/40">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                  Perfect Synergies
                </span>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
                  Complete The Look
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button className="swiper-button-prev-custom w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 hover:border-gray-900 dark:hover:border-white transition">
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <button className="swiper-button-next-custom w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 hover:border-gray-900 dark:hover:border-white transition">
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                540: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: true }}
              className="px-2 pb-6"
            >
              {relatedProducts.map((rel) => (
                <SwiperSlide key={rel._id}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    onClick={() => navigate(`/product/${rel._id}`)}
                    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-square bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                      <img 
                        src={rel?.images?.[0]?.url || 'https://via.placeholder.com/400'} 
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {rel.discountPrice && rel.discountPrice < rel.price && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          Sale
                        </span>
                      )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-2">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                          {rel.category?.name || 'Exclusive'}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {rel.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="font-black text-gray-900 dark:text-white text-sm">
                          {formatCurrency(rel.discountPrice && rel.discountPrice < rel.price ? rel.discountPrice : rel.price)}
                        </span>
                        <Rating value={rel.ratings} />
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default ProductDetails;
