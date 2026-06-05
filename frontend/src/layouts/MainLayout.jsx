import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AdminRedirectButton from '../components/admin/AdminRedirectButton';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Fixed Navbar */}
        <div className="fixed top-0 right-0 left-0 z-50">
          <Navbar />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto pt-32 sm:pt-24">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className={`min-h-full w-full bg-white dark:bg-gray-950 transition-colors duration-300 ${
                location.pathname === '/' ||
                location.pathname.startsWith('/product/') ||
                location.pathname === '/wishlist' ||
                location.pathname === '/cart' ||
                location.pathname === '/checkout' ||
                location.pathname === '/order-success'
                  ? 'px-0 py-0'
                  : location.pathname === '/products'
                  ? 'px-4 lg:px-6 pt-0 pb-6'
                  : 'px-4 lg:px-6 py-6'
              }`}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>

      {/* Admin Redirect Button */}
      <AdminRedirectButton />
    </div>
  );
};

export default MainLayout;
