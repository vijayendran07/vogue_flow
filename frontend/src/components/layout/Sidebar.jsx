
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
} from 'react-icons/fi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, openAuthModal } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Sidebar = ({
  isOpen,
  toggleSidebar,
  isDesktopCollapsed,
  toggleDesktopSidebar,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth >= 1024
      : false
  );

  const isCollapsed =
    isDesktop && isDesktopCollapsed;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener(
      'resize',
      handleResize
    );

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());

    toast.success('Logged out successfully');

    if (!isDesktop) toggleSidebar();
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: FiHome,
    },
    {
      name: 'Products',
      path: '/products',
      icon: FiGrid,
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: FiShoppingCart,
    },
    {
      name: 'Wishlist',
      path: '/wishlist',
      icon: FiHeart,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: FiUser,
    },
    {
      name: 'Orders',
      path: '/orders/me',
      icon: FiPackage,
    },
  ];

  const sidebarVariants = {
    collapsed: {
      width: 72,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },

    expanded: {
      width: 240,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },

    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },

    visible: {
      x: 0,
      width: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  return (
    <>
      {/* Mobile Overlay */}
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
            ? isDesktopCollapsed
              ? 'collapsed'
              : 'expanded'
            : isOpen
            ? 'visible'
            : 'closed'
        }
        variants={sidebarVariants}
        className="fixed inset-y-0 left-0 z-40 h-screen bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/40 shadow-sm overflow-hidden"
      >

        {/* Mobile Close Button */}
        {!isDesktop && (
          <div className="absolute top-4 right-3 z-50">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col h-full">

          {/* Logo Header */}
          <div
            className={`relative flex items-center border-b border-gray-200/60 dark:border-gray-800/60 transition-all duration-300 ${
              isCollapsed
                ? 'justify-center h-20 px-2'
                : 'justify-between h-20 px-5'
            }`}
          >

            {/* Logo */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -15,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="flex flex-col"
                >
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                    VAGUEFLOW
                  </h1>

                  <span className="text-[10px] uppercase tracking-[4px] font-bold text-gray-400 dark:text-gray-500 mt-1">
                    Premium Fashion
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Toggle */}
            {isDesktop && (
              <button
                onClick={toggleDesktopSidebar}
                className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300
                  
                  ${
                    isCollapsed
                      ? 'right-3'
                      : '-right-4'
                  }

                  z-50 p-2 rounded-xl bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  shadow-lg hover:scale-105
                  text-gray-600 dark:text-gray-300
                  hover:text-gray-900 dark:hover:text-white
                `}
              >
                {isDesktopCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={`flex-1 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${
              isCollapsed
                ? 'px-2'
                : 'px-4'
            }`}
          >
            {navItems.map(
              (item, index) => {
                const isActive =
                  location.pathname ===
                    item.path ||
                  (item.path !== '/' &&
                    location.pathname.startsWith(
                      item.path
                    ));

                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.name}
                    initial={{
                      x: -20,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                    }}
                    whileHover={{
                      y: -1,
                      scale: 1.01,
                    }}
                    transition={{
                      delay:
                        index * 0.05,
                    }}
                  >
                    <Link
                      to={item.path}
                      onClick={
                        !isDesktop
                          ? toggleSidebar
                          : undefined
                      }
                      className={`group text-sm font-semibold rounded-2xl transition-all duration-300 ${
                        isCollapsed
                          ? 'flex justify-center items-center h-12 w-full px-0 py-0'
                          : 'flex items-center gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-gray-950/95 text-white'
                          : 'text-gray-600 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl ${
                          isCollapsed
                            ? 'mx-auto'
                            : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <span
                        className={`text-sm font-semibold transition-all duration-300 ${
                          isCollapsed
                            ? 'hidden'
                            : 'ml-3 max-w-[140px] opacity-100'
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              }
            )}
          </nav>

          {/* Logout */}
          {user && (
            <div
              className={`${
                isCollapsed
                  ? 'px-2'
                  : 'px-4'
              } pb-6 mt-auto`}
            >
              <motion.button
                whileHover={{
                  y: -1,
                  scale: 1.01,
                }}
                onClick={handleLogout}
                className={`group w-full text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 rounded-2xl transition-all duration-300 ${
                  isCollapsed
                    ? 'flex justify-center items-center h-12 px-0 py-0'
                    : 'flex items-center gap-3 px-3 py-2.5'
                }`}
              >
                <div
                  className={`flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl ${
                    isCollapsed
                      ? 'mx-auto'
                      : ''
                  }`}
                >
                  <FiLogOut className="h-5 w-5" />
                </div>

                <span
                  className={`transition-all duration-300 ${
                    isCollapsed
                      ? 'hidden'
                      : 'ml-3 max-w-[140px] opacity-100'
                  }`}
                >
                  Logout
                </span>
              </motion.button>
            </div>
          )}

          {/* Auth */}
          {!user && (
            <div
              className={`${
                isCollapsed
                  ? 'px-2'
                  : 'px-4'
              } pb-6`}
            >
              <button
                onClick={() => {
                  if (!isDesktop) toggleSidebar();
                  dispatch(openAuthModal('login'));
                }}
                className={`group w-full text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 rounded-2xl transition-all duration-200 ${
                  isCollapsed
                    ? 'flex justify-center items-center h-12 w-full px-0 py-0'
                    : 'flex items-center gap-3 px-3 py-2.5'
                }`}
              >
                <div
                  className={`flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl ${
                    isCollapsed
                      ? 'mx-auto'
                      : ''
                  }`}
                >
                  <FiUser className="h-5 w-5" />
                </div>

                <span
                  className={`${
                    isCollapsed
                      ? 'hidden'
                      : 'ml-3'
                  }`}
                >
                  Sign In
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
