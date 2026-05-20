import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiGrid,
  FiHeart,
  FiUser,
  FiPackage,
  FiLogOut,
  FiShoppingCart,
  FiLayout
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [isHovered, setIsHovered] = useState(false);

  const isCollapsed = isDesktop && !isHovered;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    if (!isDesktop) toggleSidebar();
  };

  const navItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Products', path: '/products', icon: FiGrid },
    { name: 'Cart', path: '/cart', icon: FiShoppingCart },
    { name: 'Wishlist', path: '/wishlist', icon: FiHeart },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Orders', path: '/orders/me', icon: FiPackage },
    { name: 'Dashboard', path: '/dashboard', icon: FiLayout },
  ];

  const sidebarVariants = {
    collapsed: {
      width: 72,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    expanded: {
      width: 240,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    visible: {
      x: 0,
      width: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };


  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={
          isDesktop
            ? (isHovered ? 'expanded' : 'collapsed')
            : (isOpen ? 'visible' : 'closed')
        }
        variants={sidebarVariants}
        onMouseEnter={() => isDesktop && setIsHovered(true)}
        onMouseLeave={() => isDesktop && setIsHovered(false)}
        className="fixed inset-y-0 left-0 z-40 h-screen bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/40 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col h-full pt-20">

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={!isDesktop ? toggleSidebar : undefined}
                    className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-gray-950/95 text-white'
                        : 'text-gray-600 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950'
                          : 'bg-gray-100/70 text-gray-500 dark:bg-gray-900/70 dark:text-gray-400 group-hover:bg-gray-200/80 dark:group-hover:bg-white/10 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`ml-3 text-sm font-semibold transition-all duration-300 ${
                      isCollapsed
                        ? 'max-w-0 opacity-0 overflow-hidden'
                        : 'max-w-[140px] opacity-100'
                    }`}>{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Logout */}
          {user && (
            <div className="px-4 pb-6 mt-auto">
              <motion.button
                whileHover={{ y: -1, scale: 1.01 }}
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 rounded-full transition-all duration-300"
              >
                <div className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-200 group-hover:bg-red-100 dark:hover:bg-red-500/20">
                  <FiLogOut className="h-5 w-5" />
                </div>
                <span className={`ml-3 transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 overflow-hidden' : 'max-w-[140px] opacity-100'}`}>
                  Logout
                </span>
              </motion.button>
            </div>
          )}

          {/* Auth Links (if not logged in) */}
          {!user && (
            <div className="px-4 pb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                <Link
                  to="/login"
                  onClick={!isDesktop ? toggleSidebar : undefined}
                  className="group flex items-center px-4 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 rounded-3xl transition-all duration-200"
                >
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 transition-all duration-200 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Sign In</span>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
