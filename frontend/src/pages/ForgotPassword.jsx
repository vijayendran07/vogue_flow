import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../redux/slices/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/password/forgot', { email });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Forgot Password
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <button type="button" onClick={() => { navigate('/'); dispatch(openAuthModal('login')); }} className="font-medium text-primary-600 hover:text-primary-500">
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
