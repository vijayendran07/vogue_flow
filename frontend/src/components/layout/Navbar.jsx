import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiHeart,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiPackage
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, openAuthModal } from '../../redux/slices/authSlice';
import { getCategories } from '../../redux/slices/categorySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { wishlistItems = [] } = useSelector((state) => state.wishlist);
  const { categories = [] } = useSelector((state) => state.categories);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Ensure categories are loaded for the navbar links
    if (categories.length === 0) {
        dispatch(getCategories());
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
    setIsProfileOpen(false);
  };

  const getCategoryLink = (name) => {
    const cat = categories?.find(c => c.name.toLowerCase() === name.toLowerCase());
    return cat ? `/products?category=${cat._id}` : `/products?keyword=${name}`;
  };

  const navLinks = [
    { name: 'ALL PRODUCTS', path: '/products' },
    { name: 'MEN', path: getCategoryLink('men') },
    { name: 'WOMEN', path: getCategoryLink('women') },
    { name: 'KIDS', path: getCategoryLink('kids') },
    { name: 'HOME & LIVING', path: getCategoryLink('home & living') },
    { name: 'BEAUTY', path: getCategoryLink('beauty') },
    { name: 'STUDIO', path: getCategoryLink('studio'), isNew: true },
    ...(user ? [{ name: 'ORDERS', path: '/orders/me' }] : []),
  ];

  return (
    <nav className={`w-full transition-all duration-300 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30 ${
        isScrolled
          ? 'bg-white/85 dark:bg-gray-950/85 shadow-md'
          : 'bg-white/75 dark:bg-gray-950/75 shadow-sm'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Left: Logo & Menu Links */}
          <div className="flex items-center h-full">

            <Link to="/" className="flex-shrink-0 flex items-center group select-none mr-3 sm:mr-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  V
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center h-full">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center h-full px-4 text-[13px] font-bold text-gray-800 dark:text-gray-200 tracking-widest hover:border-b-4 border-pink-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                >
                  {link.name}
                  {link.isNew && (
                    <span className="absolute top-4 -right-1 text-[9px] font-black text-pink-500 uppercase tracking-widest">
                      New
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Middle: Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-6 relative">
            <form onSubmit={searchSubmitHandler} className="w-full">
              <div className="relative w-full">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-[#f5f5f6] dark:bg-gray-900 border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded-md py-2.5 pl-10 pr-4 focus:outline-none focus:bg-white dark:focus:bg-gray-950 transition text-sm text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-6 h-full pt-1">

            {/* Profile Dropdown */}
            <div className="relative flex items-center h-full group" ref={profileRef} onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
              {user ? (
                <Link to="/profile" className="flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-4 border-pink-500 h-full pb-1 cursor-pointer">
                  <FiUser className="w-[18px] h-[18px]" />
                  <span className="hidden sm:block text-[12px] font-bold">Profile</span>
                </Link>
              ) : (
                <button onClick={() => dispatch(openAuthModal('login'))} className="flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-4 border-pink-500 h-full pb-1 cursor-pointer">
                  <FiUser className="w-[18px] h-[18px]" />
                  <span className="hidden sm:block text-[12px] font-bold">Profile</span>
                </button>
              )}
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-16 right-0 w-72 bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 z-50 select-none p-4"
                  >
                    {!user ? (
                      <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Welcome</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">To access account and manage orders</p>
                        <button onClick={() => { setIsProfileOpen(false); dispatch(openAuthModal('login')); }} className="w-full block text-center border border-gray-200 dark:border-gray-700 text-pink-500 font-bold text-sm py-2.5 hover:border-pink-500 transition">
                          LOGIN / SIGNUP
                        </button>
                      </div>
                    ) : (
                      <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Hello, {user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    )}
                    
                    <div className="py-2 space-y-1">
                      <Link to="/orders/me" className="block px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold transition">Orders</Link>
                      <Link to="/wishlist" className="block px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold transition">Wishlist</Link>
                      <Link to="/profile" className="block px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold transition">Profile Details</Link>
                      {user && (
                        <button onClick={handleLogout} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold transition">
                          Logout
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition h-full pb-1 min-w-8">
              <FiHeart className="w-[18px] h-[18px]" />
              <span className="hidden sm:block text-[12px] font-bold">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="absolute top-3 right-0 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-pink-500 rounded-full min-w-[16px] h-4">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition h-full pb-1 pr-1 sm:pr-2 min-w-8">
              <FiShoppingCart className="w-[18px] h-[18px]" />
              <span className="hidden sm:block text-[12px] font-bold">Bag</span>
              {cartItems.length > 0 && (
                <span className="absolute top-3 right-0 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-pink-500 rounded-full min-w-[16px] h-4">
                  {cartItems.length}
                </span>
              )}
            </Link>


            
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={searchSubmitHandler} className="w-full">
            <div className="relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-[#f5f5f6] dark:bg-gray-900 border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded-md py-2.5 pl-10 pr-4 focus:outline-none focus:bg-white dark:focus:bg-gray-950 transition text-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </form>
        </div>

        {/* Mobile Navigation Horizontal Scroll List */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar select-none">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`whitespace-nowrap text-[10px] font-black tracking-widest px-3.5 py-1.5 rounded-full transition-all border ${
                  isActive
                    ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200/50 dark:border-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
