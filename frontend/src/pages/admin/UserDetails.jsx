import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser, toggleUserBlock, updateUserRole, addUserNote, getUserActivityLogs, clearErrors, resetUserStatus, clearUserDetails } from '../../redux/slices/userAdminSlice';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiShield,
  FiShoppingBag,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiUser,
  FiEye,
  FiPlus,
  FiSave,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import OrderTimeline from '../../components/OrderTimeline';
import UserActivityLog from '../../components/UserActivityLog';

const UserDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user, activityLogs, loading, error, isUpdated, message } = useSelector((state) => state.adminUsers);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: ''
  });
  const [blockReason, setBlockReason] = useState('');
  const [newRole, setNewRole] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    dispatch(getUserDetails(id));
    dispatch(getUserActivityLogs(id));

    return () => {
      dispatch(clearUserDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isUpdated) {
      toast.success(message || 'User updated successfully');
      dispatch(resetUserStatus());
      setIsEditing(false);
      dispatch(getUserDetails(id));
    }
  }, [dispatch, error, isUpdated, message, id]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
      setNewRole(user.role || '');
    }
  }, [user]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser({ id, userData: editData }));
  };

  const handleBlockToggle = () => {
    if (!user.isBlocked && !blockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }
    dispatch(toggleUserBlock({ id, block: !user.isBlocked, blockReason: blockReason.trim() }));
    setBlockReason('');
  };

  const handleRoleChange = () => {
    if (!newRole || newRole === user.role) return;
    dispatch(updateUserRole({ id, role: newRole }));
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }
    dispatch(addUserNote({ id, note: noteText.trim() }));
    setNoteText('');
    setShowAddNote(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      unverified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRoleBadge = (role) => {
    const styles = {
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'super-admin': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    };
    return styles[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLastSeenText = () => {
    if (!user?.lastLogin) return 'Never logged in';

    const lastLogin = new Date(user.lastLogin);
    const now = new Date();
    const diffMs = now - lastLogin;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Online now';
    if (diffHours < 24) return `Last seen ${Math.floor(diffHours)} hours ago`;
    const diffDays = diffHours / 24;
    return `Last seen ${Math.floor(diffDays)} days ago`;
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress = user.addresses?.find(addr => addr.type === 'shipping') || user.addresses?.[0];
  const billingAddress = user.addresses?.find(addr => addr.type === 'billing') || user.addresses?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/users"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <FiArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">User ID: {user._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(user.isBlocked ? 'blocked' : 'active')}`}>
            {user.isBlocked ? 'Blocked' : 'Active'}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadge(user.role)}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Information */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                    <input
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiUser className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiMail className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiPhone className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiCalendar className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiShield className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(user.isBlocked ? 'blocked' : 'active')}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                      {user.emailVerified && (
                        <FiCheckCircle className="h-4 w-4 text-green-500" title="Email Verified" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FiClock className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                    <p className="text-sm text-gray-900 dark:text-white">{getLastSeenText()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Addresses</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {shippingAddress && (
                <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiMapPin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{shippingAddress.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pinCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{shippingAddress.country}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{shippingAddress.phoneNo}</p>
                </div>
              )}
              {billingAddress && (
                <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiMapPin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Billing Address</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{billingAddress.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {billingAddress.city}, {billingAddress.state} {billingAddress.pinCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{billingAddress.country}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{billingAddress.phoneNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Orders</h3>
            {user.orderHistory && user.orderHistory.length > 0 ? (
              <div className="space-y-4">
                {user.orderHistory.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex items-center justify-between rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                        <FiShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.orderId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)} • {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{order.totalAmount}</p>
                      <Link
                        to={`/admin/order/${order.orderId}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders found</p>
            )}
          </div>

          {/* Activity Logs */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Activity Logs</h3>
            {activityLogs && activityLogs.length > 0 ? (
              <UserActivityLog activities={activityLogs} />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No activity logs found</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="space-y-4">
              {/* Block/Unblock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Status
                </label>
                {user.isBlocked && (
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Reason for blocking..."
                    className="mb-3 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                )}
                <button
                  onClick={handleBlockToggle}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    user.isBlocked
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {user.isBlocked ? (
                    <>
                      <FiUnlock className="mr-2 inline h-4 w-4" />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-2 inline h-4 w-4" />
                      Block User
                    </>
                  )}
                </button>
              </div>

              {/* Role Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Change Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mb-3 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
                <button
                  onClick={handleRoleChange}
                  disabled={newRole === user.role}
                  className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <FiShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.stats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <FiDollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{user.stats?.totalSpent || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <FiTrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{user.walletBalance || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Note</h3>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
            {showAddNote && (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this user..."
                  rows={3}
                  className="block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <FiSave className="mr-2 inline h-4 w-4" />
                    Save Note
                  </button>
                  <button
                    onClick={() => {
                      setShowAddNote(false);
                      setNoteText('');
                    }}
                    className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <FiX className="mr-2 inline h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Notes */}
          {user.notes && user.notes.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notes</h3>
              <div className="space-y-3">
                {user.notes.map((note, index) => (
                  <div key={index} className="rounded-3xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{note.note}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Added on {formatDate(note.addedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;