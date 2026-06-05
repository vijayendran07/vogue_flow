import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

const AdminRedirectButton = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Show button only for admin users and when not on admin pages
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const isOnAdminPage = location.pathname.startsWith('/admin');
  const shouldShow = isAuthenticated && isAdmin && !isOnAdminPage;

  if (!shouldShow) return null;

  const handleRedirect = () => {
    navigate('/admin/dashboard');
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleRedirect}
      className="fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-[#003e6d] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
    >
      <Shield className="w-5 h-5" />
      <span className="hidden sm:inline">Go to Admin Panel</span>
      <ArrowRight className="w-4 h-4" />
    </motion.button>
  );
};

export default AdminRedirectButton;