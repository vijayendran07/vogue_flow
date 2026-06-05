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
    <div className="mx-auto px-0 pt-0 pb-4 max-w-full">
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
        
        {/* Sidebar Filters */}
        <div className="w-full">
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters((prev) => !prev)}
                    className="w-full py-2.5 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
                >
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 lg:sticky lg:top-8`}> 
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A premium set of discovery tools for smart shopping.</p>
                        </div>
                        <button onClick={clearFilters} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">Clear All</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sortOptions.map((option) => (
                            <motion.button
                                key={option.value}
                                whileHover={{ y: -2, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 280 }}
                                onClick={() => setSort(option.value)}
                                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${sort === option.value ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </div>
                    <div className="block lg:hidden">
                        <label className="sr-only" htmlFor="mobile-sort">Sort by</label>
                        <select
                            id="mobile-sort"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 py-3 px-4"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Price Filter */}
                    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-5">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Price Range</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-400">
                                <span>Min: ₹{price[0]}</span>
                                <span>Max: ₹{price[1]}</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">Minimum</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="100"
                                        value={price[0]}
                                        onChange={(e) => handlePriceChange(e, 0)}
                                        className="w-full h-1 rounded-full accent-primary-600 bg-gray-200 dark:bg-gray-700 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">Maximum</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="100"
                                        value={price[1]}
                                        onChange={(e) => handlePriceChange(e, 1)}
                                        className="w-full h-1 rounded-full accent-primary-600 bg-gray-200 dark:bg-gray-700 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Categories</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Dropdown select</span>
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 py-3 px-4"
                        >
                            <option value="">All Categories</option>
                            {categories?.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ratings Filter */}
                    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Minimum Rating</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Dropdown select</span>
                        </div>
                        <select
                            value={ratings}
                            onChange={(e) => setRatings(Number(e.target.value))}
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 py-3 px-4"
                        >
                            <option value={0}>All Ratings</option>
                            <option value={4}>4 Stars & Above</option>
                            <option value={3}>3 Stars & Above</option>
                            <option value={2}>2 Stars & Above</option>
                            <option value={1}>1 Star & Above</option>
                        </select>
                    </div>

                    {/* Brand Filters */}
                    {/* Discount Filters */}
                    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Discount</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Select range</span>
                        </div>
                        <select
                            value={selectedDiscount}
                            onChange={(e) => setSelectedDiscount(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 py-3 px-4"
                        >
                            <option value="">All Discounts</option>
                            {discountOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    {/* Collection filter UI removed */}
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="w-full">
<div className="flex flex-col gap-2 justify-between items-start mb-4 md:items-center md:mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {keywordFromUrl ? `Search results for "${keywordFromUrl}"` : 'All Products'}
                    </h2>
                </div>
            </div>

            {error && !loading && products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white dark:bg-gray-800 square-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-2xl text-gray-600 dark:text-gray-300 font-medium">Unable to load products</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
                    <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary-600 text-white square-full hover:bg-primary-700 transition">Reset Filters</button>
                </motion.div>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white dark:bg-gray-800 square-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-96 flex flex-col">
                        <Skeleton height={200} className="mb-4 square-xl dark:opacity-20" />
                        <Skeleton count={2} className="mb-2 dark:opacity-20" />
                        <Skeleton width="40%" className="mt-auto dark:opacity-20" />
                    </div>
                    ))}
                </div>
            ) : !products || products?.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white dark:bg-gray-800 square-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-2xl text-gray-600 dark:text-gray-400 font-medium">No products match your filters.</h3>
                    <p className="mt-2 text-gray-500">Try adjusting your price range or categories.</p>
                    <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary-600 text-white square-full hover:bg-primary-700 transition">Clear Filters</button>
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
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
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 text-sm text-white">Page {currentPage}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage * resultPerPage >= productsCount}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
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
