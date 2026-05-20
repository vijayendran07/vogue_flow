import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
