import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors, logoutUser } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiCpu, FiTerminal, FiArrowLeft, FiActivity } from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom secure logger states
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
      // Reset secure terminal simulation upon authentication error
      setShowConsole(false);
      setLogs([]);
    }

    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'super-admin') {
        // Trigger cybersecurity log sequence before redirecting
        setShowConsole(true);
        runLoggerSequence();
      } else {
        toast.error('Access Denied: Insufficient administrator privileges.');
        // Sign out non-admins to allow proper administrative login
        dispatch(logoutUser());
      }
    }
  }, [dispatch, error, isAuthenticated, navigate, user]);

  const runLoggerSequence = () => {
    const consoleLogs = [
      '[SYS] Initializing TLS v1.3 handshake sequence...',
      '[SECURE] Exchanging cryptographic authentication metrics...',
      '[AUTH] Verifying administrator signatures against remote clusters...',
      '[OK] Credentials approved. Core administrative token issued.',
      '[LEDGER] Initializing admin privilege dashboard vectors...'
    ];

    setLogs([]);
    consoleLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
        if (index === consoleLogs.length - 1) {
          // Finalize login redirect after logs complete
          setTimeout(() => {
            toast.success('System Administrator Handshake Completed.');
            navigate('/admin/dashboard');
          }, 600);
        }
      }, (index + 1) * 450);
    });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please verify administrative credentials.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden select-none">
      
      {/* Dynamic Cyber background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      
      {/* Background neon laser blur nodes */}
      <motion.div 
        className="absolute top-10 left-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating return trigger */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition backdrop-blur-md"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>User Login Portal</span>
        </Link>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-md w-full p-4 relative z-10"
      >
        
        {/* Core Administrative Gateway Card */}
        <div className="p-8 sm:p-10 rounded-[36px] bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.06)] backdrop-blur-2xl relative overflow-hidden">
          
          {/* Ceiling neon laser bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-pulse" />

          <AnimatePresence mode="wait">
            {!showConsole ? (
              <motion.div
                key="admin-form-view"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FiShield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white leading-none">
                    Admin Terminal
                  </h1>
                  <p className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest">
                    VogueFlow Administrative Core Node
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5 font-mono">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Identity Identifier (Email)
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@vagueflow.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white text-xs font-semibold placeholder-gray-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 font-mono">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Authority Code Key (Password)
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 focus-within:border-purple-500 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <FiLock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white text-xs font-semibold placeholder-gray-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-mono text-xs uppercase tracking-widest">Handshake in progress...</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                          <FiCpu className="w-4 h-4" />
                          <span className="font-mono text-xs uppercase tracking-widest">Instantiate Authority</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="admin-console-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Cybersecurity Logs Simulation Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-mono text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <FiTerminal className="w-3.5 h-3.5" />
                    <span>Cryptographic Handshake</span>
                  </h3>
                </div>

                {/* Console Log window */}
                <div className="bg-black/80 rounded-2xl p-5 border border-white/5 font-mono text-[9px] text-left text-cyan-400 space-y-2 h-44 flex flex-col justify-start overflow-y-auto scrollbar-none shadow-inner">
                  {logs.map((log, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="leading-relaxed"
                    >
                      {log.startsWith('[OK]') || log.startsWith('[SUCCESS]') ? (
                        <span className="text-emerald-400">{log}</span>
                      ) : log.startsWith('[SYS]') ? (
                        <span className="text-purple-400">{log}</span>
                      ) : (
                        <span>{log}</span>
                      )}
                    </motion.div>
                  ))}
                  {logs.length < 5 && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-[8px] animate-pulse mt-2">
                      <FiActivity className="w-3 h-3 animate-spin" />
                      <span>PENDING METRICS PACKETS EXECUTION...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secure lock metadata indicator footer */}
          <div className="mt-8 flex items-center justify-between text-[8px] font-mono text-gray-600 border-t border-white/5 pt-4">
            <span className="flex items-center gap-1 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
              <span>TLS_AES_256_GCM</span>
            </span>
            <span className="uppercase">VogueFlow v3.0 Core</span>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default AdminLogin;
