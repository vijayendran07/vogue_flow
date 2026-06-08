import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import Rating from '../common/Rating';
import { FiHeart, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlistThunk, removeFromWishlistThunk } from '../../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { addToCart } from '../../redux/slices/cartSlice';
import { optimizeUnsplashUrl } from '../../utils/imageOptimizer';

const ProductCard = React.memo(({ product, isHome }) => {
  if (!product) return null;

  const dispatch = useDispatch();
  const { wishlistItems = [] } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((item) => item._id === product?._id);
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Calculate discount percentage
  const discountPercentage = product.discountPrice && product.price 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeFromWishlistThunk(product._id));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlistThunk(product));
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error("Product is out of stock!");
      return;
    }
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images && product.images[0]?.url ? product.images[0].url : '',
      stock: product.stock,
      quantity: 1
    }));
    toast.success("Added to bag!");
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const hoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.25, ease: "easeOut" }
    }
  };

  const badgeVariants = {
    initial: { scale: 0, rotate: -90 },
    animate: { scale: 1, rotate: 0, transition: { delay: 0.1, duration: 0.3, ease: "easeOut" } },
  };

  const wishlistButtonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.25 } },
    tap: { scale: 0.85 },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1, transition: { duration: 0.25 } },
  };

  const buttonVariants = {
    initial: { y: 15, opacity: 0 },
    hover: { y: 0, opacity: 1, transition: { duration: 0.25 } },
  };

  const priceContainerVariants = {
    initial: { opacity: 0.9 },
    hover: { opacity: 1, transition: { duration: 0.25 } },
  };

  if (isHome) {
    const brandName = product.brand || 'VOGUEFLOW';
    
    const getPromoOffer = () => {
      const percentage = discountPercentage > 0 ? discountPercentage : 35;
      const prefixes = ['Up to', 'Min', 'Flat'];
      const prefix = prefixes[product.name.charCodeAt(0) % prefixes.length];
      return `${prefix} ${percentage}% off`;
    };

    const getPromoSubtitle = () => {
      const catName = (product.category?.name || 'fashion').toLowerCase();
      if (catName.includes('men')) return 'Bestselling activewear';
      if (catName.includes('women')) return 'Stylish & elegant dresses';
      if (catName.includes('kids')) return 'Fun & cozy kidswear';
      if (catName.includes('home')) return 'Modern home essentials';
      if (catName.includes('beauty')) return 'Premium beauty care';
      return 'Trendiest global styles';
    };

    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={hoverVariants}
        className="h-full block"
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <Tilt
          tiltMaxAngleX={5}
          tiltMaxAngleY={5}
          scale={isCardHovered ? 1.01 : 1}
          transitionSpeed={400}
          perspective={1000}
          className="h-full block"
        >
          <Link
            to={`/product/${product._id}`}
            aria-label={`View details for ${product.name}`}
            className="group relative flex flex-col h-full rounded-none overflow-hidden transition-all duration-500 bg-transparent shadow-none"
          >
            {/* Aspect Square Image Container */}
            <div className="relative w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 flex-shrink-0 aspect-square">
              <img
                loading="lazy"
                src={product.images && product.images[0]?.url ? optimizeUnsplashUrl(product.images[0].url, 400) : 'https://via.placeholder.com/300x300'}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Bottom gradient and Brand name inside the image */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <span className="text-xs font-black tracking-widest text-white uppercase drop-shadow-md block font-sans">
                  {brandName}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all active:scale-95 pointer-events-auto"
              >
                <FiHeart
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-750'
                  }`}
                />
              </button>
            </div>

            {/* Content Section Underneath */}
            <div className="pt-3 pb-2 flex flex-col space-y-0.5 lg:space-y-1 text-left bg-transparent">
              <h3 className="text-xs lg:text-base font-black text-gray-900 dark:text-white leading-tight tracking-wide group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors duration-200">
                {getPromoOffer()}
              </h3>
              <p className="text-[10px] lg:text-sm text-gray-550 dark:text-gray-400 font-bold truncate leading-normal">
                {getPromoSubtitle()}
              </p>
            </div>
          </Link>
        </Tilt>
      </motion.div>
    );
  }

  return (
    <div className="h-full block select-none">
      <Link
        to={`/product/${product._id}`}
        aria-label={`View details for ${product.name}`}
        className="group relative flex flex-col h-full bg-[#fdfdfd] dark:bg-[#151515] border border-amber-100/50 dark:border-neutral-800/80 rounded-[28px] p-3 shadow-[0_4px_16px_rgba(212,163,115,0.05)] hover:shadow-[0_12px_32px_rgba(212,163,115,0.12)] hover:-translate-y-1 transition-all duration-300 select-none pb-4"
      >
        {/* Aspect Ratio Image Container */}
        <div className="relative w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 rounded-[20px] aspect-[3/4]">
          <img
            loading="lazy"
            src={product.images && product.images[0]?.url ? optimizeUnsplashUrl(product.images[0].url, 400) : 'https://via.placeholder.com/300x400'}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* NEW Badge overlay on Image */}
          <div className="absolute top-3 left-3 bg-[#D4A373] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow">
            NEW
          </div>

          {/* Floating Wishlist Button */}
          <button
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 p-2 rounded-full bg-white hover:scale-105 transition active:scale-95 shadow-sm pointer-events-auto"
          >
            <FiHeart
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        </div>

        {/* Content Section Underneath */}
        <div className="pt-3.5 px-1.5 flex flex-col space-y-1.5 text-left flex-grow">
          {/* Brand Name */}
          <p className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-[#B58A63] font-sans">
            {product.brand || 'VOGUEFLOW'}
          </p>

          {/* Product Name */}
          <h3 className="text-xs sm:text-[15px] font-bold text-gray-800 dark:text-gray-200 truncate leading-tight group-hover:text-[#B58A63] transition-colors">
            {product.name}
          </h3>

          {/* Price Segment */}
          <div className="flex items-center flex-wrap pt-0.5">
            {product.discountPrice && product.discountPrice < product.price ? (
              <>
                <span className="text-sm sm:text-[17px] font-extrabold text-gray-900 dark:text-white">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-[10px] sm:text-sm text-gray-400 line-through font-medium ml-1.5">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-[10px] sm:text-sm text-red-500 font-extrabold ml-2">
                  {discountPercentage}% OFF
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-[17px] font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 pb-1">
            <span className="text-amber-500">★</span>
            <span>{product.ratings || '4.5'}</span>
            <span className="text-gray-400">({product.numOfReviews || '42'})</span>
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-2 bg-gray-950 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 py-2.5 sm:py-3 rounded-[12px] sm:rounded-[14px] text-[10px] sm:text-[13px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 pointer-events-auto"
          >
            <FiShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
