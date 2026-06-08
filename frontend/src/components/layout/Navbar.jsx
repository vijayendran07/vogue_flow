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
  FiPackage,
  FiHome
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { wishlistItems = [] } = useSelector((state) => state.wishlist);
  const { categories = [] } = useSelector((state) => state.categories);

  useEffect(() => {
    // Force set to light mode on first load to transition existing dark mode clients
    const hasInitLight = sessionStorage.getItem('init_light_v2');
    let themeVal = localStorage.getItem('theme');

    if (!hasInitLight) {
      themeVal = 'light';
      localStorage.setItem('theme', 'light');
      sessionStorage.setItem('init_light_v2', 'true');
    }

    const isDarkMode = themeVal === 'dark';
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
    <>
      <nav className={`w-full transition-all duration-300 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30 ${
          isScrolled
            ? 'bg-white/85 dark:bg-gray-950/85 shadow-md'
            : 'bg-white/75 dark:bg-gray-950/75 shadow-sm'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Desktop Navbar View */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Left: Menu Links */}
            <div className="flex items-center h-full">

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center h-full">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center h-full px-4 text-[17px] font-black text-gray-800 dark:text-gray-200 tracking-widest hover:border-b-2 border-pink-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                  >
                    {link.name}
                    {link.isNew && (
                      <span className="absolute top-4 -right-1 text-[11px] font-black text-pink-500 uppercase tracking-widest">
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
                  <Link to="/profile" className="flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-2 border-pink-500 h-full pb-1 cursor-pointer">
                    <FiUser className="w-[18px] h-[18px]" />
                    <span className="hidden sm:block text-[15px] font-black uppercase tracking-widest">Profile</span>
                  </Link>
                ) : (
                  <button onClick={() => dispatch(openAuthModal('login'))} className="flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-2 border-pink-500 h-full pb-1 cursor-pointer">
                    <FiUser className="w-[18px] h-[18px]" />
                    <span className="hidden sm:block text-[15px] font-black uppercase tracking-widest">Profile</span>
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
                          <p className="text-[14px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-1">Welcome</p>
                          <p className="text-[12px] text-gray-550 dark:text-gray-400 mb-4">To access account and manage orders</p>
                          <button onClick={() => { setIsProfileOpen(false); dispatch(openAuthModal('login')); }} className="w-full block text-center border border-gray-200 dark:border-gray-700 text-pink-500 font-bold text-xs py-2 hover:border-pink-500 transition">
                            LOGIN / SIGNUP
                          </button>
                        </div>
                      ) : (
                        <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-2">
                          <p className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white truncate">Hello, {user.name}</p>
                          <p className="text-[12px] text-gray-555 dark:text-gray-400 truncate">{user.email}</p>
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
              <Link to="/wishlist" className="relative flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-2 border-pink-500 h-full pb-1 min-w-8">
                <FiHeart className="w-[18px] h-[18px]" />
                <span className="hidden sm:block text-[15px] font-black uppercase tracking-widest">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="absolute top-3 right-0 flex items-center justify-center px-1 text-[9px] font-bold text-white bg-pink-500 rounded-full min-w-[16px] h-4">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link to="/cart" className="relative flex flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition group-hover:border-b-2 border-pink-500 h-full pb-1 pr-1 sm:pr-2 min-w-8">
                <FiShoppingCart className="w-[18px] h-[18px]" />
                <span className="hidden sm:block text-[15px] font-black uppercase tracking-widest">Bag</span>
                {cartItems.length > 0 && (
                  <span className="absolute top-3 right-0 flex items-center justify-center px-1 text-[9px] font-bold text-white bg-pink-500 rounded-full min-w-[16px] h-4">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              
              {/* Logo (Moved to Right) */}
              <Link to="/" className="flex-shrink-0 flex items-center group select-none ml-2 sm:ml-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                    V
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Header (lg:hidden) */}
          <div className="lg:hidden flex items-center gap-2.5 h-16 px-2">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl text-gray-750 dark:text-gray-250 hover:bg-gray-100 dark:hover:bg-gray-900/60 transition flex-shrink-0"
              aria-label="Open Menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Mobile Search Input */}
            <div className="flex-1 min-w-0 relative pr-1">
              <form onSubmit={searchSubmitHandler} className="w-full">
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for products, brands..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-[#f5f5f6] dark:bg-gray-900 border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:bg-white dark:focus:bg-gray-950 transition text-xs text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>
              </form>
            </div>

            {/* Logo Icon (Moved to Right) */}
            <Link to="/" className="flex items-center group select-none flex-shrink-0 pl-1">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-base font-black text-white tracking-tight">V</span>
              </div>
            </Link>
          </div>

        </div>
      </nav>

      {/* Hamburger Sliding Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full lg:hidden border-r border-gray-200 dark:border-gray-800"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-black text-white">V</span>
                  </div>
                  <span className="font-black text-gray-900 dark:text-white text-base tracking-tight">VAGUEFLOW</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Search Bar in Drawer */}
                <form onSubmit={searchSubmitHandler} className="w-full">
                  <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search for products..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 focus:border-pink-550 rounded-xl py-2 pl-9 pr-4 focus:outline-none transition text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </form>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-1">Categories</p>
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span>{link.name}</span>
                        {link.isNew && (
                          <span className="bg-pink-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">New</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer / Account */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/5 dark:bg-gray-950/20">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-pink-500" />
                      </div>
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      title="Logout"
                    >
                      <FiLogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      dispatch(openAuthModal('login'));
                    }}
                    className="w-full text-center bg-gray-950 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-55 text-white dark:text-gray-950 py-2.5 rounded-xl font-bold text-sm transition"
                  >
                    LOGIN / SIGNUP
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 border-t border-gray-200 dark:border-gray-800/80 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
          {/* Home Link */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              location.pathname === '/' ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiHome className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">Home</span>
          </Link>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
              location.pathname === '/wishlist' ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiHeart className="w-5.5 h-5.5" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-2 right-6 flex items-center justify-center px-1 text-[9px] font-black text-white bg-pink-500 rounded-full min-w-[15px] h-3.5 shadow-sm">
                {wishlistItems.length}
              </span>
            )}
            <span className="text-[10px] font-bold tracking-wider uppercase">Wishlist</span>
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
              location.pathname === '/cart' ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiShoppingCart className="w-5.5 h-5.5" />
            {cartItems.length > 0 && (
              <span className="absolute top-2 right-7 flex items-center justify-center px-1 text-[9px] font-black text-white bg-pink-500 rounded-full min-w-[15px] h-3.5 shadow-sm">
                {cartItems.length}
              </span>
            )}
            <span className="text-[10px] font-bold tracking-wider uppercase">Bag</span>
          </Link>

          {/* Profile Link */}
          {user ? (
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                location.pathname === '/profile' ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiUser className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Profile</span>
            </Link>
          ) : (
            <button
              onClick={() => dispatch(openAuthModal('login'))}
              className={`flex flex-col items-center justify-center gap-1 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
            >
              <FiUser className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Profile</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
