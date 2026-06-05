import React from 'react';
import { Link } from 'react-router-dom';
import { optimizeUnsplashUrl } from '../../utils/imageOptimizer';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProductCard from './ProductCard';

// ─── Per-Category Row ──────────────────────────────────────────────────────────
const CategoryRow = ({ category, categoryProducts, fallbackImage, index }) => {
  // Alternate background: Elegant Pure White and Soft Light Gray
  const isEven = index % 2 === 0;

  return (
    <section className={`w-full px-4 lg:px-6 py-6 mb-0 border-t border-gray-100 dark:border-gray-800 ${
      isEven 
        ? 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white' 
        : 'bg-[#f8f9fa] text-gray-900 dark:bg-gray-950 dark:text-white'
    }`}>
      <div className="max-w-full">
        
        {/* ── Category Header (Line Removed) ── */}
        <div className="flex items-center justify-between pb-3 mb-4">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm">
              <img
                src={optimizeUnsplashUrl(category.image?.url || fallbackImage, 80)}
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Title + count */}
            <div>
              <h3 className={`text-xl sm:text-2xl font-black leading-tight ${
                isEven ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {category.name}
              </h3>
              <p className={`text-xs mt-0.5 ${
                isEven ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Explore link */}
          <Link
            to={`/products?category=${category._id}`}
            className={`flex items-center gap-1.5 text-sm font-bold hover:underline whitespace-nowrap ${
              isEven ? 'text-pink-600 dark:text-pink-400' : 'text-pink-600 dark:text-pink-400'
            }`}
          >
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Products Slider ── */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={(e) => {
              const slider = e.currentTarget.parentElement.querySelector('.category-slider');
              slider.scrollBy({ left: -800, behavior: 'smooth' });
            }}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-5 group-hover:translate-x-0"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              const slider = e.currentTarget.parentElement.querySelector('.category-slider');
              slider.scrollBy({ left: 800, behavior: 'smooth' });
            }}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-5 group-hover:translate-x-0"
          >
            <FiChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
          </button>

          {/* Products Row */}
          <div className="category-slider flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-2">
            {categoryProducts.map((product) => (
              <div key={product._id} className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px] flex-shrink-0">
                <ProductCard product={product} isHome={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Main Section ──────────────────────────────────────────────────────────────
const ShopByCategories = ({
  categories,
  products,
  categoryImages,
  loading,
  categoriesLoading,
  activeCoupon,
}) => {
  const fallbackImage =
    categoryImages?.[0] ||
    'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=200&q=80';

  // Build a list: category + its products (skip empty ones)
  const categoryRows = (categories || [])
    .map((cat) => ({
      category: cat,
      categoryProducts: (products || []).filter((p) => {
        if (Array.isArray(p.category)) {
          return p.category.some((c) => (c?._id || c) === cat._id);
        }
        return p.category?._id === cat._id || p.category === cat._id;
      }),
    }))
    .filter(({ categoryProducts }) => categoryProducts.length > 0);

  return (
    <div className="w-full">
      {/* ── Section Main Header ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 mb-0" style={{ background: 'linear-gradient(135deg, #C0392B 0%, #922B21 50%, #D35400 100%)' }}>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Shop By Category
          </h2>
          <p className="text-sm text-white/75 mt-2">
            All products grouped by category — explore everything
          </p>
          <Link
            to="/products"
            className="text-sm font-bold text-white hover:text-white/80 hover:underline mt-4"
          >
            All Products →
          </Link>
        </div>
      </section>

      {/* ── Loading Skeletons ── */}
      {(loading || categoriesLoading) && categoryRows.length === 0 ? (
        <div className="w-full">
          {[1, 2, 3].map((n) => (
            <section
              key={n}
              className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-[#2A3B4E] dark:bg-[#111721] mb-6"
            >
              <div className="flex items-center gap-4 mb-5">
                <Skeleton circle width={48} height={48} />
                <div>
                  <Skeleton width={120} height={18} />
                  <Skeleton width={70} height={12} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((k) => (
                  <Skeleton key={k} height={220} className="rounded-2xl" />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : categoryRows.length === 0 ? (
        /* No products yet */
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-[#FFF9C4] text-gray-900 dark:bg-[#201E10] dark:text-white text-center mb-6">
          <p className="text-gray-550 dark:text-gray-400 font-medium">
            No products available yet. Check back soon!
          </p>
        </section>
      ) : (
        /* ── Category Sections ── */
        <div className="w-full">
          {(() => {
            const hasDenim = categoryRows.some(({ category }) => 
              category.name.toLowerCase().includes('denim') || 
              category.name.toLowerCase().includes('jeans')
            );

            const hasAccessories = categoryRows.some(({ category }) => 
              category.name.toLowerCase().includes('accessories')
            );

            return categoryRows.map(({ category, categoryProducts }, index) => {
              const isDenim = category.name.toLowerCase().includes('denim') || 
                              category.name.toLowerCase().includes('jeans');

              const isAccessories = category.name.toLowerCase().includes('accessories');

              // Show "Shop Smarter, Save Bigger" banner after Home & Living
              const isHomeLiving = category.name.toLowerCase().includes('home');
              const hasHomeLiving = categoryRows.some(({ category: c }) => c.name.toLowerCase().includes('home'));
              const showShopSmartBannerAfterThis = hasHomeLiving ? isHomeLiving : index === categoryRows.length - 2;

              // Show Coupon Billboard Banner next to Denim
              const showCouponAfterThis = hasDenim ? isDenim : index === 1;

              return (
                <React.Fragment key={category._id}>
                  <CategoryRow
                    category={category}
                    categoryProducts={categoryProducts}
                    fallbackImage={fallbackImage}
                    index={index}
                  />

                  

                  {showCouponAfterThis && (
                    <section className="w-full mb-0 overflow-hidden relative">
                      <Link
                        to="/products"
                        className="relative block h-[450px] sm:h-[360px] group"
                      >
                        <img
                          src={optimizeUnsplashUrl(activeCoupon?.bgImage?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop", 1000)}
                          alt="Fashion Coupon Banner"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                          loading="lazy"
                        />
                      </Link>
                    </section>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default ShopByCategories;
