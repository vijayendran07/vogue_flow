import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearErrors } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiCheckCircle, FiShield, FiArrowLeft, FiPhone } from 'react-icons/fi';

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

const Register = () => {
  const [userState, setUserState] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { name, email, password, phone } = userState;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user: authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isAuthenticated) {
      toast.success('Patron signature initialized successfully!');
      if (authUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [dispatch, error, isAuthenticated, navigate, authUser]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error('Please verify all required registration parameters');
      return;
    }
    if (password.length < 8) {
      toast.error('Vault key signature must span at least 8 characters');
      return;
    }
    dispatch(registerUser(userState));
  };

  const onChange = (e) => {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Left Lifestyle Storytelling Showcase Column */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gray-900 text-white flex-col justify-between p-12 select-none">
        
        {/* Alternate exquisite image background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" 
            alt="Signature Portfolio Onboarding" 
            className="w-full h-full object-cover opacity-55 scale-105 transform origin-bottom transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-primary-950/20 mix-blend-multiply" />
        </div>

        {/* Ambient background blob rotation */}
        <motion.div 
          className="absolute bottom-1/3 right-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header Anchor */}
        <div className="relative z-10">
          <Link to="/" className="inline-block text-2xl font-black tracking-widest uppercase text-white">
            Vogue<span className="text-primary-400">Flow</span>
            <span className="block w-3 h-0.5 bg-primary-400 mt-1" />
          </Link>
        </div>

        {/* Core Narrative Footer Statement */}
        <div className="relative z-10 max-w-md space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white inline-block">
            Onboarding Nexus
          </span>
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Instantiate Signature Protocol.
          </h2>
          <p className="text-xs text-gray-300 font-medium leading-relaxed opacity-90">
            Establish persistent continuous verification identity layers to browse curated private releases, dynamic size matrices, and live investment portfolios.
          </p>

          <div className="pt-2 flex items-center gap-4 text-[11px] text-gray-400 font-bold">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5 text-primary-400" />
              <span>Instant Issuance</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiShield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault Authorized</span>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
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

        {/* Form viewport layout wrapper */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="max-w-md w-full mx-auto space-y-8"
        >
          
          <motion.div variants={itemVariants} className="space-y-2">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
              Identity Initializer
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Establish Signature Link
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Complete baseline client identification parameters to generate private token storage access.
            </p>
          </motion.div>

          {/* Master Form Desk Array */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleRegister}
            className="space-y-5 p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 shadow-sm backdrop-blur-xl relative"
          >
            
            {/* Soft internal gradient ceiling line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            {/* Name metric capture */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Full Patron Signature Name
              </label>
              
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  placeholder="e.g. Master Contributor"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email metric capture */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Communication Identifier (Email)
              </label>
              
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="patron@vogueflow.luxe"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Phone metric capture */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiPhone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  placeholder="e.g. +15551234567"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Vault Key parameter capture */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Vault Security Key (Password)
              </label>
              
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Min 8 characters required"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Action pipeline */}
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
                    {/* Sweeping dynamic reflection */}
                    <div className="absolute inset-0 w-1/2 h-full bg-white/15 dark:bg-black/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                    <span>Confirm Handshake Authority</span>
                    <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Signposting back matrix */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Already possess active signature mapping?{' '}
                <Link to="/login" className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 underline transition">
                  Instantiate Handshake
                </Link>
              </p>
            </div>

          </motion.form>

          {/* Core metadata footer */}
          <motion.div variants={itemVariants} className="text-center text-[10px] text-gray-400 space-y-1">
            <p>End-to-end multi-tier access framework deployment.</p>
            <p>© {new Date().getFullYear()} VogueFlow Framework. Uncompromising style fidelity.</p>
          </motion.div>

        </motion.div>

      </div>

    </div>
  );
};

export default Register;
