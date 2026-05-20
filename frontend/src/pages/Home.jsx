import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiSearch, FiArrowRight, FiChevronRight, FiCreditCard, FiTag } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { getProducts, clearErrors } from '../redux/slices/productSlice';
import { getCategories } from '../redux/slices/categorySlice';
import { getBanners } from '../redux/slices/bannerSlice';
import ProductCard from '../components/product/ProductCard';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import MetaData from '../components/MetaData';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, products } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);
  const { banners, loading: bannersLoading } = useSelector((state) => state.banners);

  const featuredProducts = useMemo(
    () => (products && products.length > 0 ? products.slice(0, 8) : []),
    [products]
  );

  const trendingProducts = useMemo(
    () => {
      if (!products || products.length === 0) return [];
      const trending = products.filter(p => p.isTrending);
      if (trending.length > 0) return trending.slice(0, 8);
      return products.slice(8, 16).length > 0 ? products.slice(8, 16) : products.slice(0, 8);
    },
    [products]
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getProducts({
      keyword: '',
      currentPage: 1,
      price: [0, 250000],
      category: '',
      ratings: 0,
      sort: 'newest'
    }));
    dispatch(getCategories());
    dispatch(getBanners());
  }, [dispatch]);

  const handleSearchClick = () => {
    navigate('/products');
  };

  // Mock category images mapping for the visual aesthetic
  const categoryImages = [
    'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=200&q=80', // Shirts
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80', // T-Shirts
    'https://images.unsplash.com/photo-1583391733958-66124620b7ba?auto=format&fit=crop&w=200&q=80', // Kurta Sets
    'https://images.unsplash.com/photo-1515347619362-75fe3f0f15c1?auto=format&fit=crop&w=200&q=80', // Dresses
    'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=200&q=80', // Kurtas
    'https://images.unsplash.com/photo-1542272604-780c8dfaf2dc?auto=format&fit=crop&w=200&q=80', // Jeans
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80', // Trousers
  ];

  const heroBanners = [
    {
      id: 1,
      title: "Deep Cleansing Action",
      subtitle: "Under ₹199",
      tag: "#DeepClean",
      bgImage: "https://images.unsplash.com/photo-1615397323136-1e075f73d573?auto=format&fit=crop&w=1200&q=80",
      brands: "Simple & POND'S"
    },
    {
      id: 2,
      title: "Premium Hydration",
      subtitle: "Up to 50% Off",
      tag: "#GlowUp",
      bgImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80",
      brands: "Lakme & Himalaya"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 text-gray-900 dark:text-gray-100 pb-20 md:pb-0">
      <MetaData title="VogueFlow - Home" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        


        {/* 2. Top Scrollable Category Bubbles */}
        <div className="mb-8">
          {categoriesLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <Skeleton circle height={72} width={72} />
                  <Skeleton width={50} height={10} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories && categories.map((category, index) => (
                <Link 
                  key={category._id} 
                  to={`/products?category=${category._id}`}
                  className="flex flex-col items-center gap-2 group flex-shrink-0"
                >
                  <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl sm:rounded-[28px] p-[2px] bg-gradient-to-br from-sky-300 via-pink-300 to-primary-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="w-full h-full rounded-2xl sm:rounded-[26px] overflow-hidden bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900">
                      <img 
                        src={category.image?.url || categoryImages[index % categoryImages.length]} 
                        alt={category.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[72px] text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3. Promotional Banner */}
        <Link to="/products" className="block mb-8 rounded-2xl overflow-hidden shadow-lg relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-rose-100 to-pink-100 dark:from-orange-900/40 dark:via-rose-900/40 dark:to-pink-900/40 mix-blend-multiply" />
          <div className="bg-gradient-to-r from-orange-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 flex items-center justify-between relative border border-rose-100 dark:border-rose-900/30">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">Get 25% Off</h3>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">Up to ₹200 Off*</p>
            </div>
            <div className="bg-white dark:bg-gray-950 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Coupon Code</span>
              <span className="font-black text-gray-900 dark:text-white">VOGUESAVE</span>
            </div>
          </div>
        </Link>

        {/* 4. Large Hero Carousel */}
        <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full aspect-[4/3] sm:aspect-[21/9]"
          >
            {(banners && banners.length > 0 ? banners : heroBanners).map((banner) => {
              const bgImgUrl = typeof banner.bgImage === 'string' ? banner.bgImage : banner.bgImage?.url;
              return (
                <SwiperSlide key={banner._id || banner.id}>
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => navigate('/products')}>
                    <img src={bgImgUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 text-white">
                      {banner.brands && (
                        <div className="inline-block bg-white text-gray-900 px-4 py-1.5 rounded-lg font-black text-xs sm:text-sm mb-4 shadow-lg">
                          {banner.brands}
                        </div>
                      )}
                      <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none mb-2 drop-shadow-lg">
                        {banner.title}
                      </h2>
                      <div className="flex items-center gap-3">
                        {banner.subtitle && <p className="text-lg font-medium text-gray-200">{banner.subtitle}</p>}
                        {banner.tag && (
                          <span className="text-sm font-bold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                            {banner.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:bg-white group-hover:text-black transition-colors">
                      <FiChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>


        {/* 6. Trending/Featured Products Horizontal List (Bottom categories style) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FiTag className="text-primary-500" /> Trending Styles
            </h3>
            <Link to="/products" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
               [1, 2, 3, 4].map(n => (
                <div key={n} className="w-full">
                  <Skeleton height={200} className="rounded-2xl" />
                </div>
               ))
            ) : (
              trendingProducts.slice(0, 4).map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="group bg-white dark:bg-gray-900 rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                  <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 relative">
                    <img 
                      src={product.images?.[0]?.url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-900 dark:text-white">
                      ₹{product.price}
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1 px-1">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 px-1 mt-0.5 line-clamp-1">{product.category?.name || 'VogueFlow'}</p>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Global CSS for hiding scrollbars but allowing scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default Home;
