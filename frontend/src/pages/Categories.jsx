import React from 'react';
import { motion } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';

const Categories = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                        <FiGrid className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Categories</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Explore our curated collections by category. This feature is currently under enhancement.
                </p>
                <button 
                    onClick={() => window.history.back()}
                    className="mt-8 px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition shadow-lg"
                >
                    Go Back
                </button>
            </motion.div>
        </div>
    );
};

export default Categories;
