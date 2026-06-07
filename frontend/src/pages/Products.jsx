import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, clearErrors } from '../redux/slices/productSlice';
import { getCategories } from '../redux/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
};

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { loading, error, products = [], productsCount = 0, resultPerPage = 0, filteredProductsCount = 0 } = useSelector(
    (state) => state.products
  );
  const { categories = [] } = useSelector((state) => state.categories);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const keywordFromUrl = queryParams.get('keyword') || '';
  const categoryFromUrl = queryParams.get('category') || '';
  const sortFromUrl = queryParams.get('sort') || 'newest';
  const ratingsFromUrl = Number(queryParams.get('ratings') || 0);
  const initialPriceFromUrl = useMemo(
    () => [
      Number(queryParams.get('price[gte]') || 0),
      Number(queryParams.get('price[lte]') || 25000),
    ],
    [queryParams]
  );
  const initialPageFromUrl = Number(queryParams.get('page') || 1);

  const sortOptions = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'New Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'lowest' },
    { label: 'Price: High to Low', value: 'highest' },
    { label: 'Best Rated', value: 'toprated' },
    { label: 'Discount %', value: 'discount' },
    { label: 'Trending', value: 'trending' },
  ];

  const discountOptions = ['10% and above', '25% and above', '40% and above', '60% and above'];
  const collectionOptions = ['New Arrivals', 'Best Sellers', 'Limited Edition', 'Premium Collection', 'Trending Now'];

  const [currentPage, setCurrentPage] = useState(initialPageFromUrl);
  const [price, setPrice] = useState(initialPriceFromUrl);
  const [category, setCategory] = useState(categoryFromUrl);
  const [ratings, setRatings] = useState(ratingsFromUrl);
  const [sort, setSort] = useState(sortFromUrl);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState('');
  // Collection filter removed

  useEffect(() => {
    setCategory(categoryFromUrl);
    setSort(sortFromUrl);
    setRatings(ratingsFromUrl);
    setPrice(initialPriceFromUrl);
    setCurrentPage(initialPageFromUrl);
  }, [categoryFromUrl, sortFromUrl, ratingsFromUrl, initialPriceFromUrl, initialPageFromUrl]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  // Handle Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(getProducts({ 
        keyword: keywordFromUrl, 
        currentPage, 
        price, 
        category, 
        ratings, 
        sort,
        discount: selectedDiscount,
        // collection filter omitted
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, keywordFromUrl, currentPage, price, category, ratings, sort, selectedDiscount]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const clearFilters = () => {
    setPrice([0, 25000]);
    setCategory("");
    setRatings(0);
    setSort("newest");
    setCurrentPage(1);
    setSelectedDiscount('');
  };

  const handlePriceChange = (e, index) => {
      const newPrice = [...price];
      newPrice[index] = Number(e.target.value);
      setPrice(newPrice);
  };

  const visibleProducts = products?.slice(0, 15);

  return (
    <div className="mx-auto px-4 pt-4 pb-6 max-w-full">
      <div className="flex flex-col gap-6">
        
        {/* Page Title / Search Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
            {keywordFromUrl ? `Search results for "${keywordFromUrl}"` : 'All Products'}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredProductsCount} of {productsCount} products
          </span>
        </div>

        {/* Top Filters Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Filters</span>
              <button onClick={clearFilters} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-pink-600 hover:text-pink-500 transition">Clear All</button>
            </div>
            
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs py-1.5 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500">Price</span>
                <select
                  value={
                    price[0] === 0 && price[1] === 25000 ? "" :
                    price[0] === 0 && price[1] === 1000 ? "under-1000" :
                    price[0] === 1000 && price[1] === 3000 ? "1000-3000" :
                    price[0] === 3000 && price[1] === 5000 ? "3000-5000" :
                    price[0] === 5000 && price[1] === 25000 ? "over-5000" : "custom"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") setPrice([0, 25000]);
                    else if (val === "under-1000") setPrice([0, 1000]);
                    else if (val === "1000-3000") setPrice([1000, 3000]);
                    else if (val === "3000-5000") setPrice([3000, 5000]);
                    else if (val === "over-5000") setPrice([5000, 25000]);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs py-1.5 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="">All Prices</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="1000-3000">₹1,000 - ₹3,050</option>
                  <option value="3000-5000">₹3,000 - ₹5,000</option>
                  <option value="over-5000">Over ₹5,000</option>
                  {(price[0] !== 0 || price[1] !== 25000) && (
                    <option value="custom" disabled>Custom (₹{price[0]} - ₹{price[1]})</option>
                  )}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500">Rating</span>
                <select
                  value={ratings}
                  onChange={(e) => setRatings(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs py-1.5 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ & Above</option>
                  <option value={3}>3★ & Above</option>
                  <option value={2}>2★ & Above</option>
                  <option value={1}>1★ & Above</option>
                </select>
              </div>

              {/* Discount Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500">Discount</span>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs py-1.5 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="">All Discounts</option>
                  {discountOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500">Sort By</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs py-1.5 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full">
          {error && !loading && products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700"
            >
              <h3 className="text-2xl text-gray-600 dark:text-gray-300 font-medium">Unable to load products</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">Reset Filters</button>
            </motion.div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-4 h-96 flex flex-col">
                  <Skeleton height={200} className="mb-4 rounded-xl dark:opacity-20" />
                  <Skeleton count={2} className="mb-2 dark:opacity-20" />
                  <Skeleton width="40%" className="mt-auto dark:opacity-20" />
                </div>
              ))}
            </div>
          ) : !products || products?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700"
            >
              <h3 className="text-2xl text-gray-600 dark:text-gray-400 font-medium">No products match your filters.</h3>
              <p className="mt-2 text-gray-500">Try adjusting your price range or categories.</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">Clear Filters</button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4"
            >
              {visibleProducts?.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Simple Pagination - Next/Prev */}
          {productsCount > resultPerPage && (
            <div className="flex justify-center mt-10 space-x-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Page {currentPage}</span>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * resultPerPage >= productsCount}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;
