import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import AdminRedirectButton from '../components/admin/AdminRedirectButton';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Fixed Navbar */}
        <div className="fixed top-0 right-0 left-0 lg:left-[72px] z-50">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto pt-28 sm:pt-20 lg:ml-[72px]">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="min-h-full w-full px-4 lg:px-6 py-6"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 lg:ml-[72px]">
          <Footer />
        </div>
      </div>

      {/* Admin Redirect Button */}
      <AdminRedirectButton />
    </div>
  );
};

export default MainLayout;
