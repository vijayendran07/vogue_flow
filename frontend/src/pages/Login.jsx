import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearErrors } from '../redux/slices/authSlice';
import { updateCartDB } from '../redux/slices/cartSlice';
import { clearWishlistDB } from '../redux/slices/wishlistSlice';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheckCircle, FiShield, FiArrowLeft, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isAuthenticated && user) {
      toast.success('Successfully authenticated signature session!');
      dispatch(updateCartDB([]));
      dispatch(clearWishlistDB());
      
      if (user.role === 'admin' || user.role === 'super-admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect ? `/${redirect}` : '/');
      }
    }
  }, [dispatch, error, isAuthenticated, navigate, user, redirect]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please complete both identity fields');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupPhone) {
      toast.error('Please verify all required registration parameters');
      return;
    }
    if (signupPassword.length < 8) {
      toast.error('Vault key signature must span at least 8 characters');
      return;
    }
    dispatch(registerUser({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      phone: signupPhone
    }));
  };

  const handleGoogleLogin = () => {
    // Generate state variable for CSRF mitigation
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const state = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
    sessionStorage.setItem('google_oauth_state', state);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';
    const scope = 'openid profile email';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&prompt=select_account`;

    // Redirect to official Google sign-in
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 relative">
      


      {/* Left Lifestyle Storytelling Showcase Column */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gray-900 text-white flex-col justify-between p-12 select-none">
        
        {/* Deep asset overlay background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
            alt="Premium Brand Showcase" 
            className="w-full h-full object-cover opacity-50 scale-105 transform origin-top transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-primary-950/20 mix-blend-multiply" />
        </div>

        {/* Ambient atmospheric lighting circles */}
        <motion.div 
          className="absolute top-1/4 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header Anchor */}
        <div className="relative z-10">
          <Link to="/" className="inline-block text-2xl font-black tracking-widest uppercase text-white">
            Vogue<span className="text-primary-400">Flow</span>
            <span className="block w-3 h-0.5 bg-primary-400 mt-1" />
          </Link>
        </div>

        {/* Philosophy statement */}
        <div className="relative z-10 max-w-md space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white inline-block">
            Secure Desk 3.0
          </span>
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Redefining Modern Silhouette.
          </h2>
          <p className="text-xs text-gray-300 font-medium leading-relaxed opacity-90">
            Authenticate signature metrics to synchronize cross-platform preferences, outstanding shipping states, and secure privilege allowances.
          </p>

          <div className="pt-2 flex items-center gap-4 text-[11px] text-gray-400 font-bold">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5 text-primary-400" />
              <span>AES-GCM Protocol</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiShield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Tracking Policy</span>
            </span>
          </div>
        </div>

      </div>

      {/* Right Core Action Column */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 relative z-10">
        
        {/* Floating return trigger */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition backdrop-blur-md"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Master Catalog</span>
          </Link>
        </div>

        {/* Mobile Viewport Header statement */}
        <div className="lg:hidden mb-8">
          <Link to="/" className="inline-block text-xl font-black tracking-widest uppercase text-gray-900 dark:text-white">
            Vogue<span className="text-primary-600 dark:text-primary-400">Flow</span>
          </Link>
        </div>

        {/* Form Viewport Logic Container */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="max-w-md w-full mx-auto space-y-8"
        >
          
          <motion.div variants={itemVariants} className="space-y-2">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
              Identity Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
              {activeTab === 'login' ? 'Welcome Back, Patron' : 'Establish Signature Link'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {activeTab === 'login' 
                ? 'Enter your verified digital signature mapping to instantiate authenticated backend parameters.'
                : 'Complete baseline client identification parameters to generate private token storage access.'}
            </p>
          </motion.div>

          {/* Core Submit Array Container */}
          <motion.div 
            variants={itemVariants}
            className="p-6 sm:p-8 rounded-[36px] bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Ambient inner form highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            {/* Sliding Tab Switcher */}
            <div className="flex bg-gray-100/50 dark:bg-black/20 p-1.5 rounded-2xl mb-6 relative">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 relative z-10 ${
                  activeTab === 'login' ? 'text-gray-950 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 relative z-10 ${
                  activeTab === 'signup' ? 'text-gray-950 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Establish Identity
              </button>
              
              {/* Sliding glass pill */}
              <div 
                className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white dark:bg-gray-900 border border-white/40 dark:border-white/10 shadow-md rounded-xl transition-all duration-500 ease-out transform ${
                  activeTab === 'signup' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Communication Identity (Email)
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patron@vogueflow.luxe"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Vault Code Signature
                      </label>
                      <Link 
                        to="/password/forgot" 
                        className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Forgot Code?
                      </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiLock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Authenticating Handshake...</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 w-1/2 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                          <span>Instantiate Session</span>
                          <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Patron Signature Name
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Master Contributor"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Communication Identity (Email)
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="patron@vogueflow.luxe"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiPhone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="e.g. +15551234567"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Vault Security Key (Password)
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <FiLock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 characters required"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating Client Profile...</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 w-1/2 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                          <span>Establish Account</span>
                          <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Google Authentication Segment */}
            <div className="mt-5 space-y-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  OR CONTINUOUS OAUTH
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                type="button"
                className="w-full h-13 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-extrabold rounded-2xl shadow-md border border-gray-200/80 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition flex items-center justify-center gap-2.5"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">Continue with Google</span>
              </motion.button>
            </div>

            {/* Admin Console Anchor */}
            <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-white/10 text-center">
              <Link 
                to="/admin/login" 
                className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline"
              >
                System Administrator? Access secure Admin Terminal →
              </Link>
            </div>

          </motion.div>

          {/* Sub-note assurance statement */}
          <motion.div variants={itemVariants} className="text-center text-[10px] text-gray-400 space-y-1">
            <p>Protected client node mapped with continuous authentication layers.</p>
            <p>© {new Date().getFullYear()} VogueFlow Corp. All signature assets reserved.</p>
          </motion.div>

        </motion.div>

      </div>

    </div>
  );
};

export default Login;
