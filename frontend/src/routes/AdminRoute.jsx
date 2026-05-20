import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="h-12 w-12 rounded-full animate-pulse bg-primary-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Authenticating admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AdminRoute;
