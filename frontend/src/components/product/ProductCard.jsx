import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import Rating from '../common/Rating';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlistThunk, removeFromWishlistThunk } from '../../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const ProductCard = React.memo(({ product }) => {
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
          className="group relative flex flex-col h-full bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 border border-white/20 dark:border-white/10"
          style={{
            boxShadow: isCardHovered
              ? '0 25px 50px rgba(56, 189, 248, 0.15), 0 0 30px rgba(168, 85, 247, 0.15)'
              : '0 4px 20px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Premium Badge */}
          {discountPercentage > 0 && (
            <motion.div
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              className="absolute top-4 left-4 z-20 pointer-events-none"
            >
              <div className="relative bg-gradient-to-r from-primary-500/80 to-purple-500/80 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md border border-white/20">
                {discountPercentage}% OFF
              </div>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <motion.button
            variants={wishlistButtonVariants}
            initial="initial"
            animate={isCardHovered ? "animate" : "initial"}
            whileTap="tap"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-xl shadow-md pointer-events-auto"
            style={{
              background: isWishlisted
                ? 'rgba(239, 68, 68, 0.25)'
                : 'rgba(255, 255, 255, 0.15)',
              border: isWishlisted
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <FiHeart
                className={`w-4 h-4 transition-all duration-300 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-950 dark:text-white'
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Image Container */}
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 flex-shrink-0">
            <motion.img
              loading="lazy"
              src={product.images && product.images[0]?.url ? product.images[0].url : 'https://via.placeholder.com/300x400'}
              alt={product.name}
              className="h-full w-full object-cover object-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Gradient Overlay on Hover */}
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate={isCardHovered ? "hover" : "initial"}
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
            />

            {/* Action Button on Hover */}
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate={isCardHovered ? "hover" : "initial"}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                variants={buttonVariants}
                className="bg-white/20 dark:bg-black/30 text-white px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest uppercase shadow-xl flex items-center gap-2 backdrop-blur-md border border-white/20 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>View Product</span>
              </motion.div>
            </motion.div>

            {/* Stock Status Badge */}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-red-500/80 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border border-white/10 backdrop-blur-md">
                  Sold Out
                </div>
              </div>
            )}
          </div>

          {/* Guaranteed Uniform Height Content Section */}
          <div className="flex flex-col flex-grow justify-between p-5 space-y-3 bg-white/5 dark:bg-black/10 backdrop-blur-xs">
            <div className="space-y-1.5">
              {/* Product Name */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <Rating value={product.ratings} text={`(${product.numOfReviews})`} />
              </div>
            </div>

            {/* Bottom Anchored Price & Stock Section */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 dark:border-white/5">
              <div className="flex items-baseline gap-2">
                {product.discountPrice && product.discountPrice < product.price ? (
                  <>
                    <p className="text-lg font-black bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {formatCurrency(product.discountPrice)}
                    </p>
                    <p className="text-xs text-gray-400 line-through font-bold">
                      {formatCurrency(product.price)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {formatCurrency(product.price)}
                  </p>
                )}
              </div>

              {/* Stock Indicator */}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="text-[9px] font-black text-orange-600 dark:text-orange-400 tracking-widest uppercase">
                  Only {product.stock} left
                </div>
              )}
            </div>
          </div>
        </Link>
      </Tilt>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
