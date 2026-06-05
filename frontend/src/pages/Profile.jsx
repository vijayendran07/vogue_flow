import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, clearErrors } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiEdit2, FiLogOut, FiShoppingBag,
  FiLock, FiCheck, FiX, FiPhone, FiMapPin, FiHeart,
  FiChevronRight, FiTag, FiHeadphones
} from 'react-icons/fi';
import api from '../services/api';

const Profile = () => {
  const { user, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(null); // 'edit' | 'password' | null
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
      setActiveSection(null);
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
        setActiveSection(null);
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
      icon: FiUser,
      label: 'My Profile',
      desc: 'View and edit your details',
      action: () => setActiveSection(activeSection === 'edit' ? null : 'edit'),
      active: activeSection === 'edit',
    },
    {
      icon: FiMapPin,
      label: 'Addresses',
      desc: user?.addresses?.[0]?.address || 'No address added',
      action: () => setActiveSection(activeSection === 'edit' ? null : 'edit'),
    },
    {
      icon: FiLock,
      label: 'Change Password',
      desc: 'Update your login password',
      action: () => setActiveSection(activeSection === 'password' ? null : 'password'),
      active: activeSection === 'password',
    },
    {
      icon: FiHeadphones,
      label: 'Help & Support',
      desc: 'FAQs and contact us',
      link: '/faq',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">

      {/* ── Main Profile Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        {/* ── LEFT: Red gradient card ── */}
        <div className="relative sm:w-[44%] bg-gradient-to-br from-red-500 via-red-600 to-rose-700 px-8 pt-10 pb-8 flex flex-col items-center text-center select-none overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

          {/* Avatar */}
          <div
            className="relative w-28 h-28 mx-auto mb-4 cursor-pointer group"
            onClick={() => document.getElementById('avatar-input').click()}
          >
            <div className="w-28 h-28 rounded-full border-4 border-white/80 shadow-xl overflow-hidden">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f43f5e&color=fff&size=128`}
                alt={user?.name}
                className="w-full h-full object-cover group-hover:opacity-80 transition duration-200"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition duration-200">
              <FiEdit2 className="w-5 h-5 text-white" />
            </div>
            {/* Verified badge */}
            <div className="absolute bottom-0.5 right-0.5 w-7 h-7 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow">
              <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Name */}
          <h2 className="text-xl font-black text-white tracking-wide leading-snug drop-shadow mb-1">
            {user?.name}
          </h2>

          {/* Divider line */}
          <div className="w-10 h-0.5 bg-white/40 rounded-full my-2" />

          {/* Tagline */}
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-[2.5px] mb-6">
            Style Is A Way To Say Who You Are.
          </p>

          {/* Stats */}
          <div className="w-full rounded-2xl bg-black/20 border border-white/10 grid grid-cols-3 divide-x divide-white/10 overflow-hidden">
            <Link to="/orders/me" className="flex flex-col items-center gap-1 py-3 hover:bg-white/10 transition">
              <FiShoppingBag className="w-4 h-4 text-white/80" />
              <span className="text-lg font-black text-white">—</span>
              <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">Orders</span>
            </Link>
            <Link to="/wishlist" className="flex flex-col items-center gap-1 py-3 hover:bg-white/10 transition">
              <FiHeart className="w-4 h-4 text-white/80" />
              <span className="text-lg font-black text-white">—</span>
              <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">Wishlist</span>
            </Link>
            <div className="flex flex-col items-center gap-1 py-3">
              <FiTag className="w-4 h-4 text-white/80" />
              <span className="text-lg font-black text-white">—</span>
              <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">Coupons</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: White menu panel ── */}
        <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const Wrapper = item.link ? Link : 'button';
              const wrapperProps = item.link
                ? { to: item.link }
                : { onClick: item.action, type: 'button' };

              return (
                <Wrapper
                  key={item.label}
                  {...wrapperProps}
                  className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors text-left ${item.active ? 'bg-red-50 dark:bg-gray-800' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                  </div>
                  <FiChevronRight className={`w-4 h-4 shrink-0 transition-transform ${item.active ? 'rotate-90 text-red-500' : 'text-gray-400'}`} />
                </Wrapper>
              );
            })}
          </div>

          {/* Logout button */}
          <div className="p-5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider transition shadow-md shadow-red-500/20 active:scale-[0.98]"
            >
              <FiLogOut className="w-4 h-4" />
              LOG OUT
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Expandable: Edit Profile ── */}
      <AnimatePresence>
        {activeSection === 'edit' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Edit Profile</h3>
              {[
                { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your name' },
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'Your email' },
                { label: 'Phone Number', value: phone, setter: setPhone, type: 'text', placeholder: 'Your phone number' },
              ].map(({ label, value, setter, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">{label}</label>
                  <input
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    type={type}
                    placeholder={placeholder}
                    className="block w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Your address"
                  className="block w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  <FiCheck /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setActiveSection(null); setName(user?.name || ''); setEmail(user?.email || ''); setPhone(user?.phone || ''); setAddress(user?.addresses?.[0]?.address || ''); }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FiX /> Cancel
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                Member Since {user?.createdAt ? String(user.createdAt).substring(0, 10) : 'N/A'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expandable: Change Password ── */}
      <AnimatePresence>
        {activeSection === 'password' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg p-6 sm:p-8">
              <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                {[
                  { label: 'Current Password', value: oldPassword, setter: setOldPassword },
                  { label: 'New Password', value: newPassword, setter: setNewPassword },
                  { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">{label}</label>
                    <input
                      type="password"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                  >
                    <FiCheck /> {pwSaving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveSection(null); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <FiX /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
