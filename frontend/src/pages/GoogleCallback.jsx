import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleLoginUser } from '../redux/slices/authSlice';
import { updateCartDB } from '../redux/slices/cartSlice';
import { clearWishlistDB } from '../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertTriangle } from 'react-icons/fi';
import MetaData from '../components/MetaData';

const GoogleCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasTriggeredRef = useRef(false);

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      toast.error('Invalid OAuth callback parameters.');
      navigate('/login');
      return;
    }

    // CSRF verification
    const savedState = sessionStorage.getItem('google_oauth_state');
    if (!savedState || savedState !== state) {
      toast.error('Security handshake verification failed: State parameter mismatch. Potential CSRF detected.');
      navigate('/login');
      return;
    }

    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      sessionStorage.removeItem('google_oauth_state');
      dispatch(googleLoginUser({ code, state }));
    }
  }, [dispatch, navigate, searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/login');
    }

    if (isAuthenticated && user) {
      toast.success('Successfully authenticated signature session with Google!');
      dispatch(updateCartDB([]));
      dispatch(clearWishlistDB());

      if (user.role === 'admin' || user.role === 'super-admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [error, isAuthenticated, user, navigate, dispatch]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 relative select-none">
      <MetaData title="VogueFlow - Verification Desk" />

      {/* Atmospheric glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full mx-4 p-8 rounded-[36px] bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

        <div className="w-16 h-16 rounded-full bg-white dark:bg-black/20 flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-100 dark:border-white/5 relative">
          <FcGoogle className="w-8 h-8 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping duration-1500" />
        </div>

        <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight leading-none mb-2">
          Secure Authenticating Signature
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          Synchronizing verified identity token with VogueFlow credentials ledger.
        </p>

        {/* Console loading panel */}
        <div className="bg-black/5 dark:bg-black/40 rounded-2xl p-5 font-mono text-[10px] text-left text-primary-600 dark:text-primary-400 space-y-2 border border-black/5 dark:border-white/5 h-28 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> [Handshake] CSRF state key verification passed
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-2.5 w-2.5 border-2 border-primary-500 border-t-transparent rounded-full" />
              <span>[Auth] Invoking Google profile resolver...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500">
              <FiAlertTriangle className="w-3 h-3" />
              <span>[Error] Exchange failed: {error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> [Auth] Session registered on secure ledger
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleCallback;
