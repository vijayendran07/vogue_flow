import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../redux/slices/authSlice';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
       return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      const { data } = await api.put(`/password/reset/${token}`, { password, confirmPassword });
      toast.success(data.message || 'Vault key renewed successfully');
      navigate('/');
      dispatch(openAuthModal('login'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Reset Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
