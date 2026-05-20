import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 flex flex-col antialiased transition-colors duration-300 relative overflow-x-hidden">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
