import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { logoutUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Custom hook for authentication utilities
 * Provides common auth operations and state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  const checkAuth = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return false;
    }
    return true;
  }, [isAuthenticated, navigate]);

  const requireAuth = useCallback((callback) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    callback();
  }, [isAuthenticated, navigate]);

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    // Methods
    handleLogout,
    checkAuth,
    requireAuth,
  };
};

export default useAuth;
