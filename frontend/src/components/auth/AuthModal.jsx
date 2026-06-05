import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearErrors, closeAuthModal, setAuthModalMode } from '../../redux/slices/authSlice';
import { updateCartDB } from '../../redux/slices/cartSlice';
import { clearWishlistDB } from '../../redux/slices/wishlistSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthModalOpen, authModalMode, loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Handle successful auth redirection
  useEffect(() => {
    if (isAuthenticated && user && isAuthModalOpen) {
      toast.success('Successfully authenticated!');
      dispatch(updateCartDB([]));
      dispatch(clearWishlistDB());
      dispatch(closeAuthModal());
      
      // Role-based redirection
      if (user.role === 'admin' || user.role === 'super-admin') {
        navigate('/admin/dashboard');
      } else {
        // Just stay on current page
        // The modal closes itself
      }
    }
  }, [isAuthenticated, user, isAuthModalOpen, dispatch, navigate]);

  useEffect(() => {
    if (error && isAuthModalOpen) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch, isAuthModalOpen]);

  // Reset forms when mode changes or modal opens
  useEffect(() => {
    if (!isAuthModalOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please complete both fields');
      return;
    }
    dispatch(loginUser({ email: loginEmail, password: loginPassword }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regPhone) {
      toast.error('Please verify all required registration parameters');
      return;
    }
    if (regPassword.length < 8) {
      toast.error('Password must span at least 8 characters');
      return;
    }
    dispatch(registerUser({ name: regName, email: regEmail, password: regPassword, phone: regPhone }));
  };

  const isLogin = authModalMode === 'login';

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeAuthModal())}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            {/* Close Button */}
            <button
              onClick={() => dispatch(closeAuthModal())}
              className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Header Area */}
            <div className="pt-10 pb-6 px-8 text-center bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                {isLogin ? 'Log in or sign up' : 'Create an account'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {isLogin ? 'Get personalised suggestions, offers & more' : 'Join VogueFlow to unlock premium fashion'}
              </p>
            </div>

            {/* Forms */}
            <div className="px-8 py-8">
              {isLogin ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(closeAuthModal());
                        navigate('/password/forgot');
                      }}
                      className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-pink-500/20"
                  >
                    {loading ? 'Authenticating...' : 'Login'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    required
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    required
                  />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    required
                  />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password (Min 8 chars)"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-pink-500/20"
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Area Toggle */}
            <div className="px-8 pb-8 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalMode(isLogin ? 'register' : 'login'))}
                  className="ml-1 text-pink-600 dark:text-pink-400 font-bold hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
              
              <p className="text-[10px] text-gray-400 mt-6 max-w-xs mx-auto leading-relaxed">
                By continuing, I agree to VogueFlow's 
                <span className="underline ml-1 cursor-pointer">Terms & Conditions</span> and 
                <span className="underline ml-1 cursor-pointer">Privacy Policy</span>
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
