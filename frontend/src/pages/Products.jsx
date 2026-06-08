import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, clearErrors } from '../redux/slices/productSlice';
import { getCategories } from '../redux/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, error, products = [], productsCount = 0, resultPerPage = 0, filteredProductsCount = 0 } = useSelector(
    (state) => state.products
  );
  const { categories = [] } = useSelector((state) => state.categories);

  // URL parameters parsing
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

  // Sorting and Filtering options
  const sortOptions = [
    { label: 'New Arrivals', value: 'newest' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price: Low to High', value: 'lowest' },
    { label: 'Price: High to Low', value: 'highest' },
    { label: 'Best Rated', value: 'toprated' },
    { label: 'Discount %', value: 'discount' },
    { label: 'Trending', value: 'trending' },
  ];

  const discountOptions = [
    { label: '10% & above', value: '10% and above' },
    { label: '25% & above', value: '25% and above' },
    { label: '40% & above', value: '40% and above' },
    { label: '60% & above', value: '60% and above' },
  ];

  // Local State
  const [currentPage, setCurrentPage] = useState(initialPageFromUrl);
  const [price, setPrice] = useState(initialPriceFromUrl);
  const [category, setCategory] = useState(categoryFromUrl);
  const [ratings, setRatings] = useState(ratingsFromUrl);
  const [sort, setSort] = useState(sortFromUrl);
  const [selectedDiscount, setSelectedDiscount] = useState('');

  // Sync state with URL params
  useEffect(() => {
    setCategory(categoryFromUrl);
    setSort(sortFromUrl);
    setRatings(ratingsFromUrl);
    setPrice(initialPriceFromUrl);
    setCurrentPage(initialPageFromUrl);
  }, [categoryFromUrl, sortFromUrl, ratingsFromUrl, initialPriceFromUrl, initialPageFromUrl]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  // Fetch products with debounce (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(
        getProducts({
          keyword: keywordFromUrl,
          currentPage,
          price,
          category,
          ratings,
          sort,
          discount: selectedDiscount,
        })
      );
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, keywordFromUrl, currentPage, price, category, ratings, sort, selectedDiscount]);

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Helper to sync local filter state to URL (improves shareability & routing)
  const updateUrlParams = (newParams) => {
    const nextParams = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    navigate(`/products?${nextParams.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setCurrentPage(1);
    updateUrlParams({ category: val, page: 1 });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSort(val);
    updateUrlParams({ sort: val });
  };

  const handleRatingChange = (e) => {
    const val = Number(e.target.value);
    setRatings(val);
    updateUrlParams({ ratings: val });
  };

  const handleDiscountChange = (e) => {
    const val = e.target.value;
    setSelectedDiscount(val);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (e) => {
    const val = e.target.value;
    let newPrice = [0, 25000];
    if (val === 'under-1000') newPrice = [0, 1000];
    else if (val === '1000-3000') newPrice = [1000, 3000];
    else if (val === '3000-5000') newPrice = [3000, 5000];
    else if (val === 'over-5000') newPrice = [5000, 25000];
    
    setPrice(newPrice);
    setCurrentPage(1);
    updateUrlParams({
      'price[gte]': newPrice[0],
      'price[lte]': newPrice[1],
      page: 1
    });
  };

  const clearFilters = () => {
    setPrice([0, 25000]);
    setCategory('');
    setRatings(0);
    setSort('newest');
    setCurrentPage(1);
    setSelectedDiscount('');
    navigate('/products');
  };

  // Determine active category name for display
  const activeCategoryName = categories.find((c) => c._id === category)?.name || '';

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 max-w-[1440px] min-h-screen bg-[#fafafa] dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col gap-8">
        
       

        {/* Filters Panel */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between lg:justify-start gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-950 dark:text-white">Filter By</h3>
              {(category || ratings > 0 || selectedDiscount || price[0] !== 0 || price[1] !== 25000) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-black uppercase tracking-widest text-pink-500 hover:text-pink-600 transition duration-250 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Category</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-xs py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Price Range</label>
                <select
                  value={
                    price[0] === 0 && price[1] === 25000 ? '' :
                    price[0] === 0 && price[1] === 1000 ? 'under-1000' :
                    price[0] === 1000 && price[1] === 3000 ? '1000-3000' :
                    price[0] === 3000 && price[1] === 5000 ? '3000-5000' :
                    price[0] === 5000 && price[1] === 25000 ? 'over-5000' : 'custom'
                  }
                  onChange={handlePriceRangeChange}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-xs py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                >
                  <option value="">All Prices</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="1000-3000">₹1,000 - ₹3,000</option>
                  <option value="3000-5000">₹3,000 - ₹5,000</option>
                  <option value="over-5000">Over ₹5,000</option>
                  {price[0] !== 0 && price[1] !== 25000 && (
                    <option value="custom" disabled>Custom (₹{price[0]} - ₹{price[1]})</option>
                  )}
                </select>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Rating</label>
                <select
                  value={ratings}
                  onChange={handleRatingChange}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-xs py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ & Above</option>
                  <option value={3}>3★ & Above</option>
                  <option value={2}>2★ & Above</option>
                  <option value={1}>1★ & Above</option>
                </select>
              </div>

              {/* Discount */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Discount</label>
                <select
                  value={selectedDiscount}
                  onChange={handleDiscountChange}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-xs py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                >
                  <option value="">All Discounts</option>
                  {discountOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Sort By</label>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-xs py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid Section */}
        <div className="w-full">
          {error && !loading && products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm max-w-xl mx-auto px-4">
              <h3 className="text-xl text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wider mb-2">Unable to load products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={clearFilters} 
                className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition duration-200"
              >
                Reset Connection & Filters
              </button>
            </div>
          ) : loading ? (
            /* Loading Shimmer Skeletons */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-150 dark:border-gray-800 p-3 h-[420px] flex flex-col gap-4 shadow-sm">
                  <Skeleton height="70%" className="rounded-[20px] dark:opacity-20" />
                  <Skeleton width="40%" height={15} className="dark:opacity-20" />
                  <Skeleton width="85%" height={18} className="dark:opacity-20" />
                  <Skeleton width="60%" height={20} className="mt-auto dark:opacity-20" />
                </div>
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm max-w-xl mx-auto px-4">
              <h3 className="text-xl text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wider mb-2">No matching products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We couldn't find any products matching your current filters. Try relaxing your constraints.</p>
              <button 
                onClick={clearFilters} 
                className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition duration-200"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product._id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* Clean Editorial Pagination Controls */}
          {productsCount > resultPerPage && (
            <div className="flex justify-center items-center mt-14 gap-6">
              <button
                onClick={() => {
                  const prevPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(prevPage);
                  updateUrlParams({ page: prevPage });
                }}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all select-none cursor-pointer"
              >
                Prev
              </button>
              
              <span className="text-xs font-black tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                Page {currentPage}
              </span>
              
              <button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  updateUrlParams({ page: nextPage });
                }}
                disabled={currentPage * resultPerPage >= filteredProductsCount}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all select-none cursor-pointer"
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
