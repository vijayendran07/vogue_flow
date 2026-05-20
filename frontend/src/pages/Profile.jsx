import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, clearErrors } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiEdit2, FiLogOut, FiShoppingBag, FiLock, FiCheck, FiX, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../services/api';

const Profile = () => {
  const { user, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || '');

  // Password change state
  const [showPwForm, setShowPwForm] = useState(false);
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
    if (!name.trim() || !email.trim()) {
      return toast.error('Name and email are required');
    }
    setSaving(true);
    try {
      const payload = { name, email, phone, address };
      if (avatar) {
        payload.avatar = avatar;
      }
      const { data } = await api.put('/me/update', payload);
      if (data.success) {
        toast.success('Profile updated successfully!');
        // Reload user data by re-fetching
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setPwSaving(true);
    try {
      const { data } = await api.put('/password/update', { oldPassword, newPassword, confirmPassword });
      if (data.success) {
        toast.success('Password updated successfully!');
        setShowPwForm(false);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=96`}
                alt={user?.name}
                className="h-24 w-24 rounded-2xl border-4 border-white dark:border-gray-800 object-cover shadow-lg group-hover:opacity-75 transition duration-200"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition duration-200">
                <FiEdit2 className="w-5 h-5 text-white" />
              </div>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          {/* Name & Email Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Email Address</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Phone Number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="text"
                      className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your address"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                    >
                      <FiCheck /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setName(user?.name || ''); setEmail(user?.email || ''); setPhone(user?.phone || ''); setAddress(user?.addresses?.[0]?.address || ''); }}
                      className="flex items-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {user?.name}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 uppercase">
                      {user?.role || 'user'}
                    </span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-sm">
                    <FiMail className="w-4 h-4 flex-shrink-0" /> {user?.email}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-sm">
                    <FiPhone className="w-4 h-4 flex-shrink-0" /> {user?.phone || 'No phone number provided'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-start gap-1.5 text-sm">
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span className="whitespace-pre-line">{user?.addresses?.[0]?.address || 'No address provided'}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                    Member since {user?.createdAt ? String(user.createdAt).substring(0, 10) : 'N/A'}
                  </p>
                </div>
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700 my-6" />

          {/* Change Password */}
          <div className="mb-6">
            <button
              onClick={() => setShowPwForm(!showPwForm)}
              className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <FiLock className="w-4 h-4" />
              {showPwForm ? 'Hide Password Form' : 'Change Password'}
            </button>
            <AnimatePresence>
              {showPwForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePasswordChange}
                  className="mt-4 space-y-3 overflow-hidden"
                >
                  {[
                    { label: 'Current Password', value: oldPassword, setter: setOldPassword },
                    { label: 'New Password', value: newPassword, setter: setNewPassword },
                    { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                      <input
                        type="password"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {pwSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders/me"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition"
            >
              <FiShoppingBag className="w-4 h-4" /> My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
