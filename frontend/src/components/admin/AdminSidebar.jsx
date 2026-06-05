import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Ticket
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const AdminSidebar = ({ isOpen, toggleSidebar, isDesktopCollapsed, toggleDesktopSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const sidebarVariants = {
    collapsed: {
      width: 70,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    expanded: {
      width: 250,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const isExpanded = isMobile ? isOpen : !isDesktopCollapsed;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl ${
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''
        }`}
        variants={sidebarVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50 shrink-0">
          <motion.div
            className="flex items-center space-x-3"
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              x: isExpanded ? 0 : -20,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </motion.div>

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Arrow Toggle */}
          {!isMobile && (
            <button
              onClick={toggleDesktopSidebar}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-900/40 text-white border-l-4 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`
                }
                onClick={() => isMobile && toggleSidebar()}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          className="ml-3 font-medium"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-blue-500/10 rounded-xl"
                        layoutId="activeBackground"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-700/50">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="ml-3 font-medium"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;
