import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDesktopSidebar = () => {
        setIsDesktopCollapsed((prev) => !prev);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isDesktopCollapsed={isDesktopCollapsed}
                toggleDesktopSidebar={toggleDesktopSidebar}
            />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
                <div className="flex items-center justify-between h-16 px-4">
                    <motion.button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <Menu className="w-6 h-6" />
                    </motion.button>
                    <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </div>

            <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 transition-all duration-300 ${
                isDesktopCollapsed ? 'md:ml-[70px]' : 'md:ml-[250px]'
            }`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
