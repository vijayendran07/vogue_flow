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

  const [currentPage, setCurrentPage] = useState(initialPageFromUrl);
  const [price, setPrice] = useState(initialPriceFromUrl);
  const [category, setCategory] = useState(categoryFromUrl);
  const [ratings, setRatings] = useState(ratingsFromUrl);
  const [sort, setSort] = useState(sortFromUrl);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
        sort 
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, keywordFromUrl, currentPage, price, category, ratings, sort]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const clearFilters = () => {
    setPrice([0, 25000]);
    setCategory("");
    setRatings(0);
    setSort("newest");
    setCurrentPage(1);
  };

  const handlePriceChange = (e, index) => {
      const newPrice = [...price];
      newPrice[index] = Number(e.target.value);
      setPrice(newPrice);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters((prev) => !prev)}
                    className="w-full py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                    <button onClick={clearFilters} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Clear All</button>
                </div>

                {/* Price Filter */}
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Price Range</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                            <span>Min: ₹{price[0]}</span>
                            <span>Max: ₹{price[1]}</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Min Price</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="10000" 
                                    step="100"
                                    value={price[0]} 
                                    onChange={(e) => setPrice([Number(e.target.value), price[1]])} 
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Max Price</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="10000" 
                                    step="100"
                                    value={price[1]} 
                                    onChange={(e) => setPrice([price[0], Number(e.target.value)])} 
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Categories</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                        <li 
                            className={`cursor-pointer text-sm transition-colors ${category === "" ? "text-primary-600 font-bold" : "text-gray-600 dark:text-gray-400 hover:text-primary-500"}`}
                            onClick={() => setCategory("")}
                        >
                            All Categories
                        </li>
                        {categories?.map((c) => (
                            <li 
                                key={c._id}
                                className={`cursor-pointer text-sm transition-colors ${category === c._id ? "text-primary-600 font-bold" : "text-gray-600 dark:text-gray-400 hover:text-primary-500"}`}
                                onClick={() => setCategory(c._id)}
                            >
                                {c.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ratings Filter */}
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Minimum Rating</h4>
                    <select 
                        value={ratings} 
                        onChange={(e) => setRatings(Number(e.target.value))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none dark:bg-gray-700 dark:text-white text-sm"
                    >
                        <option value="0">All Ratings</option>
                        <option value="4">4 Stars & Above</option>
                        <option value="3">3 Stars & Above</option>
                        <option value="2">2 Stars & Above</option>
                        <option value="1">1 Star & Above</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                    {keywordFromUrl ? `Search results for "${keywordFromUrl}"` : 'All Products'}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({filteredProductsCount || products.length} items)</span>
                </h2>
                
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <select 
                        value={sort} 
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none dark:bg-gray-700 dark:text-white"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="lowest">Price: Low to High</option>
                        <option value="highest">Price: High to Low</option>
                        <option value="toprated">Top Rated</option>
                    </select>
                </div>
            </div>

            {error && !loading && products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-2xl text-gray-600 dark:text-gray-300 font-medium">Unable to load products</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
                    <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition">Reset Filters</button>
                </motion.div>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-96 flex flex-col">
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
                    className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-2xl text-gray-600 dark:text-gray-400 font-medium">No products match your filters.</h3>
                    <p className="mt-2 text-gray-500">Try adjusting your price range or categories.</p>
                    <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition">Clear Filters</button>
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {products?.map((product) => (
                    <motion.div key={product._id} variants={itemVariants}>
                        <ProductCard product={product} />
                    </motion.div>
                    ))}
                </motion.div>
            )}
            
            {/* Simple Pagination - Next/Prev */}
            {resultPerPage < filteredProductsCount && (
                <div className="flex justify-center mt-12 space-x-4">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Page {currentPage}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={products?.length < resultPerPage}
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
