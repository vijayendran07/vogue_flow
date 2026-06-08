import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, clearErrors } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiLogOut, FiShoppingBag,
  FiLock, FiChevronRight, FiHeadphones, FiCamera,
  FiHeart
} from 'react-icons/fi';
import api from '../services/api';

const Profile = () => {
  const { user, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('edit'); // 'edit' | 'password'
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || '');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) return toast.error('Name and email are required');
    setSaving(true);
    try {
      const payload = { name, email, phone, address };
      if (avatar) payload.avatar = avatar;
      const { data } = await api.put('/me/update', payload);
      if (data.success) {
        toast.success('Profile updated successfully!');
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwSaving(true);
    try {
      const { data } = await api.put('/password/update', { oldPassword, newPassword, confirmPassword });
      if (data.success) {
        toast.success('Password updated successfully!');
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  const menuItems = [
    {
      id: 'edit',
      icon: FiUser,
      label: 'Profile Details',
      action: () => setActiveSection('edit'),
    },
    {
      id: 'password',
      icon: FiLock,
      label: 'Security & Password',
      action: () => setActiveSection('password'),
    },
    {
      id: 'orders',
      icon: FiShoppingBag,
      label: 'My Orders',
      link: '/orders/me',
    },
    {
      id: 'wishlist',
      icon: FiHeart,
      label: 'My Wishlist',
      link: '/wishlist',
    },
    {
      id: 'help',
      icon: FiHeadphones,
      label: 'Help & Support',
      link: '/faq',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-900 dark:text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Master Page Header */}
        <div className="mb-8 lg:mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white uppercase">
            Account Details
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Manage your personal profile, security settings, and orders.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* ── LEFT SIDEBAR ── */}
          <div className="w-full lg:w-1/4 space-y-6">
            
            {/* User Mini Profile */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center">
              <div
                className="relative w-24 h-24 mb-4 cursor-pointer group"
                onClick={() => document.getElementById('avatar-input').click()}
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111827&color=fff&size=128`}
                    alt={user?.name}
                    className="w-full h-full object-cover group-hover:opacity-50 transition duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition duration-300">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
                <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-950 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase">
                Member Since {user?.createdAt ? String(user.createdAt).substring(0, 4) : 'N/A'}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const Wrapper = item.link ? Link : 'button';
                const wrapperProps = item.link
                  ? { to: item.link }
                  : { onClick: item.action, type: 'button' };
                
                const isActive = activeSection === item.id;

                return (
                  <Wrapper
                    key={item.id}
                    {...wrapperProps}
                    className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left ${isActive ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-black' : 'text-gray-500'}`} />
                    <span className="flex-1 text-xs font-bold uppercase tracking-widest">
                      {item.label}
                    </span>
                    {!item.link && (
                      <FiChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-black' : 'text-gray-400'}`} />
                    )}
                  </Wrapper>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold uppercase tracking-widest transition"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
            
          </div>

          {/* ── RIGHT MAIN CONTENT ── */}
          <div className="flex-1 w-full">
            <AnimatePresence mode="wait">
              {activeSection === 'edit' && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-gray-950 dark:text-white mb-1">Profile Details</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Update your personal information and delivery address.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your name' },
                      { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'Your email address' },
                      { label: 'Phone Number', value: phone, setter: setPhone, type: 'text', placeholder: 'Your phone number' },
                    ].map(({ label, value, setter, type, placeholder }) => (
                      <div key={label} className={label === 'Email Address' ? 'md:col-span-2' : ''}>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                        <input
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          type={type}
                          placeholder={placeholder}
                          className="block w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition text-sm"
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Delivery Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        placeholder="Your full delivery address"
                        className="block w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-gray-950 dark:text-white mb-1">Security & Password</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ensure your account is using a long, random password to stay secure.</p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                    {[
                      { label: 'Current Password', value: oldPassword, setter: setOldPassword },
                      { label: 'New Password', value: newPassword, setter: setNewPassword },
                      { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                        <input
                          type="password"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          required
                          className="block w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition text-sm"
                        />
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="submit"
                        disabled={pwSaving}
                        className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {pwSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
