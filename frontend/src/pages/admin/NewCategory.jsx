import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, clearErrors } from '../../redux/slices/categorySlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLayers, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NewCategory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector((state) => state.categories);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
    }, [dispatch, error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            return toast.error("Category name is required");
        }

        const categoryData = { name, description };
        
        const resultAction = await dispatch(createCategory(categoryData));
        if (createCategory.fulfilled.match(resultAction)) {
            toast.success("Category created successfully");
            navigate('/admin/categories');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center">
                    <FiLayers className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Category</h2>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                placeholder="e.g. Men's Clothing"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm resize-none"
                                placeholder="Enter category description..."
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/categories')}
                                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors shadow-sm"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    <>
                                        <FiSave className="mr-2" /> Save Category
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default NewCategory;
