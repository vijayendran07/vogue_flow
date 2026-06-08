import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { optimizeUnsplashUrl } from '../utils/imageOptimizer';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiSearch, FiArrowRight, FiChevronRight,FiChevronLeft, FiCreditCard, FiTag } from 'react-icons/fi';
import api from '../services/api';

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
import ShopByCategories from '../components/product/ShopByCategories';

const Home = () =>{
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, products } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);
  const { banners, loading: bannersLoading } = useSelector((state) => state.banners);

  const [activeCoupon, setActiveCoupon] = useState(null);

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
      limit: 150,
      price: [0, 250000],
      category: '',
      ratings: 0,
      sort: 'newest'
    }));
    dispatch(getCategories());
    dispatch(getBanners());

    // Fetch active coupons dynamically for the banner
    const fetchActiveCoupons = async () => {
      try {
        const { data } = await api.get('/coupons');
        if (data.success && data.coupons && data.coupons.length > 0) {
          // Use the first active coupon (nearest expiry)
          setActiveCoupon(data.coupons[0]);
        }
      } catch (err) {
        console.error('Failed to fetch coupons for home banner', err);
      }
    };
    fetchActiveCoupons();
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

  const offerCards = [
    {
      title: 'Flat 30% Off',
      subtitle: 'On selected fashion picks',
      cta: 'Shop Deals',
      query: '/products?sort=lowest',
      tone: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Buy 2 Get 1',
      subtitle: 'Applies on trending styles',
      cta: 'Explore Trend',
      query: '/products?sort=toprated',
      tone: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Free Delivery',
      subtitle: 'On orders above INR 1000',
      cta: 'Start Shopping',
      query: '/products',
      tone: 'from-emerald-500 to-teal-500',
    },
  ];

  const topRatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
      .slice(0, 4);
  }, [products]);

  const priceDropProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products
      .filter((p) => p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price)
      .slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100 pb-10 md:pb-0">
      <MetaData title="VogueFlow - Home" />

      {/* Main Container - full bleed */}
      <div className="w-full overflow-hidden">
        


        {/* 4. Large Hero Carousel */}
        <section className="w-full mb-0 overflow-hidden relative border-b border-gray-100 dark:border-gray-800">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full aspect-[25/8]">
            {(banners && banners.length > 0 ? banners : heroBanners).map((banner) => {
              const bgImgUrl = optimizeUnsplashUrl(typeof banner.bgImage === 'string' ? banner.bgImage : banner.bgImage?.url, 1200);
              return (
                <SwiperSlide key={banner._id || banner.id}>
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => navigate('/products')}>
                    <img src={bgImgUrl} alt={banner.title || "VogueFlow Campaign"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                    
                    
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </section>

        {/* 2. Scrollable Category Bubbles */}
        <section className="w-full px-4 lg:px-6 py-4 bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">
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
            <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories && categories.map((category, index) => (
                <Link 
                  key={category._id} 
                  to={`/products?category=${category._id}`}
                  className="flex flex-col items-center gap-2 group flex-shrink-0"
                >
                  <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl sm:rounded-[28px] p-[2px] bg-pink-500 group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="w-full h-full rounded-2xl sm:rounded-[26px] overflow-hidden bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900">
                      <img 
                        src={optimizeUnsplashUrl(category.image?.url || categoryImages[index % categoryImages.length], 120)} 
                        alt={category.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[72px] text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

{/* 6. Shop By Categories With Products */}
<ShopByCategories
  categories={categories}
  products={products}
  categoryImages={categoryImages}
  loading={loading}
  categoriesLoading={categoriesLoading}
  activeCoupon={activeCoupon}
/>





       

        

{/* 14. Brand Content / SEO Section */}
<section className="w-full px-4 lg:px-8 py-10 bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200">
  <div className="max-w-full text-left font-sans">
    
    <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white">
      VOGUEFLOW – Online Shopping Website
    </h3>
    
    <h4 className="text-sm sm:text-[15px] font-bold mb-2 uppercase text-gray-900 dark:text-white">
      FASHION THAT DEFINES YOUR LIFESTYLE
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      If you are looking for the ultimate destination for fashion, lifestyle, and trend-driven shopping in India, VOGUEFLOW is the perfect place for you. Discover premium fashion, modern streetwear, accessories, footwear, beauty essentials, and lifestyle collections crafted for the next generation.
    </p>

    <h4 className="text-[13px] sm:text-sm font-bold mt-6 mb-2 text-gray-900 dark:text-white">
      Men’s Fashion
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      Explore oversized T-shirts, relaxed-fit jeans, cargo pants, hoodies, jackets, coordinated outfits, and modern essentials designed for everyday confidence and effortless style. Check out a range of <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Men's Clothing</span> to take your wardrobe to the next level. You will find tons of options in terms of fits, price, and more.
    </p>

    <h4 className="text-[13px] sm:text-sm font-bold mt-6 mb-2 text-gray-900 dark:text-white">
      Women’s Fashion
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      Discover elegant dresses, trendy tops, ethnic wear, co-ords, oversized fits, skirts, and statement pieces inspired by global fashion culture and modern aesthetics. Explore a wide range of offerings from savvy brands. You will also find plenty of options in <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Western Wear</span>, <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Ethnic Wear</span>, Dresses, and more.
    </p>

    <h4 className="text-[13px] sm:text-sm font-bold mt-6 mb-2 text-gray-900 dark:text-white">
      Footwear & Accessories
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      At VOGUEFLOW, you will always find plenty of <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Footwear</span> to keep your style fresh. Complete your look with premium sneakers, sandals, watches, bags, sunglasses, jewellery, and fashion accessories crafted for comfort, utility, and style.
    </p>

    <h4 className="text-[13px] sm:text-sm font-bold mt-6 mb-2 text-gray-900 dark:text-white">
      Beauty & Home Living
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      If you are still on the lookout for the perfect <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Beauty Essentials</span> that suit your daily needs and fit your budget, you are guaranteed to find them at VOGUEFLOW. Refresh your lifestyle with skincare, grooming essentials, décor, bedding, organizers, and modern home collections designed for contemporary living spaces.
    </p>

    <h4 className="text-[13px] sm:text-sm font-bold mt-6 mb-2 text-gray-900 dark:text-white">
      Premium Fashion At Affordable Prices
    </h4>
    <p className="text-[13px] sm:text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
      At VOGUEFLOW, we believe fashion should be accessible to everyone. From premium streetwear and seasonal collections to everyday essentials and exclusive drops, our platform combines quality, affordability, and trend-driven fashion in one modern shopping experience. Experience <span className="text-pink-600 dark:text-pink-400 cursor-pointer hover:underline">Fast Delivery</span>, Secure Payments, and Easy Returns on all your orders.
    </p>

  </div>
</section>

{/* 14. Popular Searches */}
<section className="w-full px-4 lg:px-6 py-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800">
 

    {/* Heading */}
    <div className="flex items-center justify-between mb-6">

      <div>
        
        <h2 className="text-lg text-gray-900 dark:text-white font-bold mt-2">
        
          Popular Searches
        
        </h2>
      </div>
    </div>

    {/* Search Tags */}
    <div className="flex flex-wrap gap-3">

      {[
        'Blazer',
        'Boots',
        'Bag',
        'Blouse Designs',
        'Jackets',
        'Earrings',
        'Dresses',
        'Kurtis',
        'Kurta Set For Women',
        'Blankets',
        'Sport Shoes',
        'Sweaters',
        'Shirts',
        'Gowns',
        'Kurtas',
        'Track Pants',
        'Socks',
        'Co Ord Sets Women',
        'Hoodies',
        'Sarees',
        'Jeans',
        'Bras',
        'Shoes',
        'Sandals',
        'Watches',
        'Tshirts',
        'Lehenga',
        'Flip Flops',
        'Tops',
        'Shapewear',
        'Sneakers',
        'Mama Earth',
        'Leggings',
        'Salwars',
        'Dress Material',
        'Shoes For Men',
        'Puma',
        'Crocs',
        'Snitch',
        'H&M',
        'Luggage Bags',
        'Trolley Bags',
        'Boleros',
        'Skirts',
        'Top',
        'Sharara',
        'Bedsheets',
        'Towels',
        'Nike',
        'Adidas',
        'Sports Shoes',
      ].map((item) => (
        <Link
          key={item}
          to={`/products?keyword=${item}`}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
        >
          {item}
        </Link>
      ))}
    </div>
 
</section>




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
        .dark-section h2 {
          color: #ffffff !important;
        }
        .dark-section p.text-gray-500 {
          color: #e4e4e7 !important;
        }
        .dark-section a.text-primary-600 {
          color: #f472b6 !important;
        }
      `}} />
    </div>
  );
};

export default Home;


