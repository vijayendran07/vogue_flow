import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
