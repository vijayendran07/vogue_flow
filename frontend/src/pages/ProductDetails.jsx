import React, { useEffect, useState, useRef, useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { optimizeUnsplashUrl } from '../utils/imageOptimizer';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails, clearErrors, getProducts, newReview, resetProductState } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlistThunk, removeFromWishlistThunk } from '../redux/slices/wishlistSlice';
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

// Helper to map color name to CSS hex color
const getColorHex = (colorName) => {
  const lower = colorName.toLowerCase().trim();
  if (lower === 'white' || lower.includes('white') || lower === 'cream' || lower === 'off-white' || lower.includes('off-white') || lower.includes('offwhite') || lower === 'beige') {
    return '#FFFFFF';
  }
  if (lower === 'black' || lower.includes('black') || lower === 'stealth black' || lower === 'charcoal') {
    return '#1A1A1A';
  }
  if (lower.includes('blue') || lower.includes('navy')) {
    return '#1E3A8A';
  }
  if (lower.includes('red') || lower.includes('crimson') || lower.includes('maroon')) {
    return '#BE123C';
  }
  if (lower.includes('green') || lower.includes('olive') || lower.includes('sage')) {
    return '#0F766E';
  }
  if (lower.includes('gray') || lower.includes('grey') || lower.includes('silver')) {
    return '#9CA3AF';
  }
  if (lower.includes('pink') || lower.includes('rose')) {
    return '#EC4899';
  }
  if (lower.includes('yellow') || lower.includes('gold')) {
    return '#F59E0B';
  }
  if (lower.includes('orange') || lower.includes('peach')) {
    return '#F97316';
  }
  if (lower.includes('purple') || lower.includes('lavender') || lower.includes('violet')) {
    return '#7C3AED';
  }
  if (lower.includes('brown') || lower.includes('tan') || lower.includes('camel') || lower.includes('khaki')) {
    return '#78350F';
  }
  
  const fallbackPalette = ['#111827', '#1E3A8A', '#4B5563', '#F9FAFB', '#0F766E', '#7C3AED', '#BE123C'];
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % fallbackPalette.length;
  return fallbackPalette[idx];
};

const ProductDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: '50%', y: '50%' });
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Interactive Selectors for Variants
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  const imageContainerRef = useRef(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [localReviews, setLocalReviews] = useState([]);

  const { product = {}, products = [], loading, error, isReviewSubmitted } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems = [] } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((item) => item._id === product?._id);
  const productImages = product?.images ?? [];
  const selectedImageUrl = optimizeUnsplashUrl(productImages?.[selectedImage]?.url || 'https://via.placeholder.com/800', 800);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isReviewSubmitted) {
      toast.success('Review submitted successfully!');
      dispatch(resetProductState());
      setShowReviewModal(false);
      setRating(0);
      setComment('');
      dispatch(getProductDetails(id));
    }
  }, [dispatch, error, isReviewSubmitted, id]);

  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
      // Reset local states on product change
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [dispatch, id]);

  // Synchronise database reviews to dynamic local state
  useEffect(() => {
    if (product?.reviews) {
      setLocalReviews(product.reviews);
    }
  }, [product?.reviews]);

  // Fetch related products
  useEffect(() => {
    if (product?.category) {
      let categoryId;
      if (Array.isArray(product.category)) {
        if (product.category.length > 0) {
          const firstCat = product.category[0];
          categoryId = firstCat?._id || firstCat;
        }
      } else {
        categoryId = product.category._id || product.category;
      }
      if (categoryId) {
        dispatch(getProducts({ category: categoryId, currentPage: 1 })).then((res) => {
          if (res.payload?.products) {
            const filtered = res.payload?.products.filter((p) => p._id !== product._id).slice(0, 6);
            setRelatedProducts(filtered);
          }
        });
      }
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
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    }));
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your bag`);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (!product?._id) return;
    if (isWishlisted) {
      dispatch(removeFromWishlistThunk(product._id));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlistThunk(product));
      toast.success("Added to wishlist");
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      toast.error('Login to draft a review');
      return;
    }
    setShowReviewModal(true);
  };

  const submitReviewHandler = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    dispatch(newReview({
      productId: id,
      rating,
      comment
    }));

    // Instantly append new review dynamically to the local UI state
    const dynamicReview = {
      _id: `LOCAL-${Date.now()}`,
      name: user?.name || "Patron Patron",
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    setLocalReviews((prev) => [dynamicReview, ...prev]);

    toast.success('Review created dynamically!');
    setShowReviewModal(false);
    setRating(0);
    setComment('');
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

  const sizes = useMemo(() => {
    const variantSizes = (product?.variants || [])
      .map((v) => v?.size)
      .filter(Boolean)
      .map((s) => s.trim());
    return [...new Set(variantSizes)];
  }, [product?.variants]);

  const sizesKey = sizes.join(',');
  useEffect(() => {
    if (sizes.length > 0) {
      if (!sizes.includes(selectedSize)) {
        setSelectedSize(sizes[0]);
      }
    } else {
      setSelectedSize('');
    }
  }, [sizesKey, selectedSize]);

  const colorImageMap = useMemo(() => {
    const map = {};
    const variantColors = (product?.variants || [])
      .map((v) => v?.color)
      .filter(Boolean)
      .map((c) => c.trim());
    const uniqueColors = [...new Set(variantColors)];

    if (uniqueColors.length > 0 && productImages.length > 0) {
      uniqueColors.forEach((color, idx) => {
        map[color] = idx % productImages.length;
      });
    }
    return map;
  }, [product?.variants, productImages]);

  const allColors = useMemo(() => {
    return Object.keys(colorImageMap);
  }, [colorImageMap]);

  const colors = useMemo(() => {
    let compatibleColors = allColors;
    if (selectedSize) {
      const variantColors = (product?.variants || [])
        .filter((v) => v?.size?.trim().toLowerCase() === selectedSize.trim().toLowerCase())
        .map((v) => v?.color)
        .filter(Boolean)
        .map((c) => c.trim());
      compatibleColors = [...new Set(variantColors)];
    }

    // Sort colors so that white, cream, beige, or off-white shades come first
    const sortedColors = [...compatibleColors].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aIsWhite = aLower.includes('white') || aLower.includes('cream') || aLower.includes('beige') || aLower.includes('off-white') || aLower.includes('offwhite');
      const bIsWhite = bLower.includes('white') || bLower.includes('cream') || bLower.includes('beige') || bLower.includes('off-white') || bLower.includes('offwhite');
      if (aIsWhite && !bIsWhite) return -1;
      if (!aIsWhite && bIsWhite) return 1;
      return 0;
    });

    return sortedColors.map((name) => ({
      name,
      hex: getColorHex(name),
      imageIndex: colorImageMap[name] ?? 0,
    }));
  }, [allColors, selectedSize, colorImageMap]);

  useEffect(() => {
    if (colors.length > 0) {
      const exists = colors.some((c) => c.name === selectedColor);
      if (!exists) {
        setSelectedColor(colors[0].name);
        setSelectedImage(colors[0].imageIndex ?? 0);
      }
    } else {
      setSelectedColor('');
    }
  }, [id, colors, selectedColor]);

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
      <div className="min-h-screen bg-[#0f1b2e] pt-10">
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
        className="flex items-center justify-center min-h-[80vh] bg-[#0f1b2e]"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-850 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mb-6"
          >
            <FiAlertCircle className="h-20 w-20 text-red-500 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-905 dark:text-white mb-3 tracking-tight">Product Unavailable</h1>
          <p className="text-gray-650 dark:text-gray-400 mb-8 leading-relaxed">
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
      className="min-h-screen bg-[#0f1b2e] text-white antialiased transition-colors duration-300"
    >
      {/* Main Container Grid */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-6">
        
        {/* Back Button */}
        <div className="mb-6">
          <motion.button
            variants={buttonVariants}
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition"
          >
            <FiArrowLeft className="w-4 h-4 text-pink-500" />
            <span>Back</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* ── Left Column: Immersive Gallery Suite ── */}
          <motion.div variants={itemVariants} className="lg:col-span-7 flex gap-3">
            {/* Vertical Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 w-[72px] flex-shrink-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden aspect-square border-2 transition-all duration-200 ${
                      selectedImage === idx
                        ? 'border-white shadow-lg'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img src={optimizeUnsplashUrl(img.url, 150)} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Viewport */}
            <div className="flex-grow relative">
              <div 
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="overflow-hidden rounded-3xl bg-gray-800/40 border border-white/10 flex items-center justify-center cursor-crosshair group w-full aspect-[4/3] relative"
              >
                {/* Product Badges Overlay */}
                {discountPercentage > 0 && (
                  <span className="absolute top-6 left-6 z-20 px-3.5 py-1.5 bg-[#e61e43] text-white text-[10px] font-black tracking-wider uppercase rounded-md shadow-lg">
                    SAVE {discountPercentage}%
                  </span>
                )}

                {/* Zoom Hint Overlay */}
                <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full shadow-md text-white">
                  <FiMaximize2 className="w-4 h-4" />
                </div>

                {/* Main Rendered High-Res Asset */}
                <motion.div 
                  className="w-full h-full overflow-hidden flex items-center justify-center"
                  style={{
                    transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}`,
                    scale: zoomLevel
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImageUrl}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.3 }}
                      transition={{ duration: 0.25 }}
                      src={selectedImageUrl}
                      alt={product?.name}
                      className="w-full h-full object-cover object-center select-none"
                    />
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Mobile Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 mt-2">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`rounded-lg overflow-hidden w-16 h-16 flex-shrink-0 border-2 transition-all ${
                        selectedImage === idx ? 'border-white' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={optimizeUnsplashUrl(img.url, 150)} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Right Column: Premium Sticky Specification Suite ── */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 space-y-4"
          >
            {/* New Arrival Badge */}
            <span className="inline-block px-3 py-1 bg-[#00b272] text-white text-[10px] font-black uppercase tracking-widest rounded-md">
              NEW ARRIVAL
            </span>

            {/* Product Name & Wishlist Row */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide leading-tight capitalize">
                {product?.name}
              </h1>
              <button
                onClick={toggleWishlist}
                className="p-3.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-md shrink-0 flex items-center justify-center"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
            
            {/* Reviews Overview Snippet */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 flex-wrap">
              <Rating value={product?.ratings || 5} />
              <span className="text-white font-bold ml-1">
                {product?.ratings ? Number(product.ratings).toFixed(1) : '5.0'}
              </span>
              <span>
                ({product?.numOfReviews || 0} Reviews)
              </span>
              <span>•</span>
              <span className="font-mono">
                SKU: {product?._id?.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Premium Pricing Tier */}
            <div className="p-5 rounded-2xl bg-[#131c31] border border-white/5 space-y-1.5">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                PRICE
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-white">
                  {formatCurrency(currentActivePrice)}
                </span>
                
                {discountPercentage > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product?.price)}
                    </span>
                    <span className="text-xs font-bold text-[#00b272] bg-[#00b272]/15 px-2.5 py-0.5 rounded border border-[#00b272]/20">
                      Save {formatCurrency(product.price - currentActivePrice)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Modern Size Selector Matrix */}
            {sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">
                    SIZE: <span className="text-white ml-1">{selectedSize.toUpperCase()}</span>
                  </label>
                  <button className="text-xs font-bold text-blue-400 hover:underline">
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-10 min-w-[40px] px-4 flex items-center justify-center rounded-lg font-bold text-xs border transition-all ${
                        selectedSize === sz
                          ? 'bg-white text-gray-900 border-white shadow-md'
                          : 'bg-[#131c31]/50 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {sz.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modern Colour Customisation Interface */}
            {colors.length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-300">
                  SHADE: <span className="text-white ml-1">{selectedColor.toUpperCase()}</span>
                </label>

                <div className="flex flex-wrap items-center gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(c.name); setSelectedImage(c.imageIndex ?? 0); }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        selectedColor === c.name 
                          ? 'ring-2 ring-offset-2 ring-white ring-offset-[#0f1b2e] border-white scale-110' 
                          : 'opacity-70 hover:opacity-100 border-gray-600'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <FiCheck className={`w-3 h-3 drop-shadow ${c.hex === '#FFFFFF' ? 'text-gray-900' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Combined Stock Status, Stepper & Add to Bag Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 mt-6 p-2 rounded-2xl ">
              {/* Stock Status */}
              <div className="flex items-center justify-center px-3 rounded-xl bg-white/5 border border-white/10 shrink-0 min-h-[48px]">
                {product?.stock > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Stepper */}
              <div className="bg-white/10 border border-white/20 rounded-xl flex items-center px-1 select-none shrink-0 min-h-[48px]">
                <button onClick={decreaseQuantity} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-gray-300 hover:text-white hover:bg-white/10 transition">−</button>
                <span className="w-8 text-center font-bold text-white text-sm">{quantity}</span>
                <button onClick={increaseQuantity} disabled={product?.stock <= quantity} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-30">+</button>
              </div>

              {/* Add to Bag */}
              <motion.button
                variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap"
                disabled={product?.stock < 1}
                onClick={addToCartHandler}
                className="flex-grow min-h-[48px] bg-white text-gray-900 font-bold text-sm rounded-xl shadow-md hover:bg-gray-100 transition flex items-center justify-center gap-2 px-4"
              >
                <FiShoppingCart className="w-4 h-4" />
                Add to Bag
              </motion.button>
            </div>

            {/* Buy Now */}
            <motion.button
              variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap"
              disabled={product?.stock < 1}
              onClick={() => { addToCartHandler(); navigate('/checkout'); }}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
               Buy Now
            </motion.button>

          </motion.div>
        </div>
      </div>

      {/* Modern Reviews Framework */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Owner Voices
            </h2>
            <p className="text-xs text-gray-400 pt-1">
              Real world feedback gathered from authenticated community patrons
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-3xl font-black text-white">
              {product?.ratings ? Number(product.ratings).toFixed(1) : '5.0'}
            </span>
            <div>
              <Rating value={product?.ratings || 5} />
              <p className="text-xs text-gray-450 font-semibold pt-0.5">
                Based on {product?.numOfReviews || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {localReviews && localReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localReviews.map((rev, idx) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#131c31]/40 border border-white/5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{rev.name}</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Verified Buyer
                      </span>
                    </div>
                    <Rating value={rev.rating} />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                  <span>Helpful validation?</span>
                  <button className="font-bold text-white hover:underline">
                    Yes (0)
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#131c31]/20 rounded-3xl border border-dashed border-white/10">
            <p className="text-gray-400 font-medium mb-3">Be the first to curate your experience</p>
            <button 
              onClick={handleWriteReviewClick}
              className="px-6 py-2.5 bg-white text-gray-900 rounded-full text-xs font-bold shadow hover:scale-105 transition">
              Draft a Review
            </button>
          </div>
        )}
        
        {localReviews && localReviews.length > 0 && (
          <div className="text-center mt-10">
            <button 
              onClick={handleWriteReviewClick}
              className="px-8 py-3 bg-white text-gray-900 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition">
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#131c31] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative text-white"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <h3 className="text-2xl font-black text-white mb-6">Submit Your Review</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-650'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0f1b2e] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Share your thoughts about this product..."
                  />
                </div>
                
                <button
                  onClick={submitReviewHandler}
                  disabled={loading}
                  className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Related Assets Slider */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-white/10 py-16 bg-[#131c31]/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Perfect Synergies
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight mt-1">
                  Complete The Look
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button className="swiper-button-prev-custom w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#131c31] hover:border-white transition">
                  <FiArrowLeft className="w-4 h-4 text-white" />
                </button>
                <button className="swiper-button-next-custom w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#131c31] hover:border-white transition">
                  <FiArrowRight className="w-4 h-4 text-white" />
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
                    className="group cursor-pointer bg-[#131c31]/50 rounded-2xl overflow-hidden border border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-square bg-gray-900/40 relative overflow-hidden">
                      <img 
                        src={optimizeUnsplashUrl(rel?.images?.[0]?.url || 'https://via.placeholder.com/400', 400)} 
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
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {rel.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="font-black text-white text-sm">
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
