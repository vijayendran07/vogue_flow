import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllUsers,
  getUserAnalytics,
  toggleUserBlock,
  updateUserRole,
  deleteUser,
  bulkUpdateUsers,
  exportUsers,
  clearErrors,
  resetUserStatus
} from '../../redux/slices/userAdminSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUnlock,
  FiLock,
  FiCheckSquare,
  FiSquare,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import * as XLSX from 'xlsx';

const statusBadge = (status) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };
  return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const roleBadge = (role) => {
  const styles = {
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    'super-admin': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  };
  return styles[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const UserList = () => {
  const dispatch = useDispatch();
  const {
    users,
    analytics,
    usersCount,
    resultPerPage,
    currentPage,
    totalPages,
    loading,
    error,
    isUpdated,
    isDeleted,
    bulkUpdateSuccess,
    message
  } = useSelector((state) => state.adminUsers);

  const [filters, setFilters] = useState({
    keyword: '',
    role: '',
    status: '',
    sort: 'newest',
    page: 1,
    limit: 12,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isUpdated) {
      toast.success(message || 'User updated successfully');
      dispatch(resetUserStatus());
    }
    if (isDeleted) {
      toast.success(message || 'User deleted successfully');
      dispatch(resetUserStatus());
    }
    if (bulkUpdateSuccess) {
      toast.success(message || 'Bulk operation completed');
      dispatch(resetUserStatus());
      setSelectedUsers([]);
      setBulkAction('');
    }
  }, [dispatch, error, isUpdated, isDeleted, bulkUpdateSuccess, message]);

  useEffect(() => {
    dispatch(getAllUsers(filters));
    dispatch(getUserAnalytics());
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: searchInput, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, keyword: '', page: 1 }));
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select users and an action');
      return;
    }

    let action = '';
    let value = '';

    switch (bulkAction) {
      case 'block':
        action = 'block';
        break;
      case 'unblock':
        action = 'unblock';
        break;
      case 'change-role':
        action = 'change-role';
        value = 'user'; // Default to user role
        break;
      case 'delete':
        action = 'delete';
        break;
      default:
        return;
    }

    dispatch(bulkUpdateUsers({ userIds: selectedUsers, action, value }));
  };

  const exportToExcel = async () => {
    try {
      const resultAction = await dispatch(exportUsers());
      if (exportUsers.fulfilled.match(resultAction)) {
        const worksheet = XLSX.utils.json_to_sheet(resultAction.payload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        XLSX.writeFile(workbook, `users-export-${Date.now()}.xlsx`);
        toast.success('Users exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const handleQuickAction = (userId, action, value) => {
    switch (action) {
      case 'block':
        dispatch(toggleUserBlock({ id: userId, block: true, blockReason: 'Manual block by admin' }));
        break;
      case 'unblock':
        dispatch(toggleUserBlock({ id: userId, block: false }));
        break;
      case 'change-role':
        dispatch(updateUserRole({ id: userId, role: value }));
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user?')) {
          dispatch(deleteUser(userId));
        }
        break;
      default:
        break;
    }
  };

  const analyticsCards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers || 0,
      icon: FiUserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Blocked Users',
      value: analytics?.blockedUsers || 0,
      icon: FiUserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'Verified Users',
      value: analytics?.verifiedUsers || 0,
      icon: FiMail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage users, roles, and permissions across your platform
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export Excel
          </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((card, index) => (
          <div key={index} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value || 0}</p>
              </div>
              <div className={`rounded-full p-3 ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <form onSubmit={searchSubmitHandler} className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 pl-12 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <FiSearch className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            {filters.keyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-3 text-xs text-primary-600 hover:text-primary-800"
              >
                Clear
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest-spending">Highest Spending</option>
                <option value="most-orders">Most Orders</option>
                <option value="last-login">Last Login</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              {selectedUsers.length} user(s) selected
            </p>
            <div className="flex flex-wrap gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Choose Action</option>
                <option value="block">Block Users</option>
                <option value="unblock">Unblock Users</option>
                <option value="change-role">Change Role</option>
                <option value="delete">Delete Users</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Apply Action
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Skeleton height={50} count={8} className="mb-4 dark:opacity-20" />
        </div>
      ) : users && users.length > 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={selectAllUsers}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {selectedUsers.length === users.length && users.length > 0 ? (
                        <FiCheckSquare className="h-5 w-5" />
                      ) : (
                        <FiSquare className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserSelection(user._id)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        {selectedUsers.includes(user._id) ? (
                          <FiCheckSquare className="h-5 w-5" />
                        ) : (
                          <FiSquare className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(user.isBlocked ? 'blocked' : 'active')}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>Orders: {user.totalOrders || 0}</div>
                      <div>Spent: ₹{user.totalSpent || 0}</div>
                      <div className="text-xs">
                        {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/user/${user._id}`}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleQuickAction(user._id, user.isBlocked ? 'unblock' : 'block')}
                          className={`transition-colors ${user.isBlocked ? 'text-green-600 hover:text-green-700' : 'text-orange-500 hover:text-orange-600'}`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <FiUnlock className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleQuickAction(user._id, 'delete')}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete User"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * resultPerPage) + 1} to {Math.min(currentPage * resultPerPage, usersCount)} of {usersCount} users
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <FiChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="inline-flex items-center rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
