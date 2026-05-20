import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag, FiClock, FiPercent, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expireAt, setExpireAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (id) => {
    try {
      const { data } = await api.put(`/admin/coupon/${id}`);
      if (data.success) {
        toast.success(`Coupon status updated!`);
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { data } = await api.delete(`/admin/coupon/${id}`);
      if (data.success) {
        toast.success('Coupon deleted successfully!');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountPercentage || !expireAt) {
      return toast.error('All fields are required!');
    }
    if (discountPercentage < 1 || discountPercentage > 100) {
      return toast.error('Discount percentage must be between 1 and 100');
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/coupon/new', {
        code: code.toUpperCase(),
        discountPercentage: Number(discountPercentage),
        expireAt,
      });
      if (data.success) {
        toast.success('Coupon created successfully!');
        setCode('');
        setDiscountPercentage('');
        setExpireAt('');
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiTag className="text-primary-500" /> Coupons & Discounts
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage e-commerce coupon codes, discount rates, expiry rules, and active states.
            </p>
          </div>

          <div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-white shadow-sm hover:bg-primary-700 transition font-bold text-sm"
            >
              <FiPlus className="w-4 h-4" /> Create Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Coupon Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Discount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Expiry Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Toggle</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 6 }).map((_, cell) => (
                    <td key={cell} className="px-6 py-5"><Skeleton height={24} /></td>
                  ))}
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                  <FiAlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  No coupons found. Create your first coupon to get started!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const isExpired = new Date(coupon.expireAt) < new Date();
                const statusLabel = isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive';
                const badgeClass = isExpired 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                  : coupon.isActive 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';

                return (
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <FiTag className="w-4 h-4" />
                        </div>
                        <span className="font-mono font-bold text-sm tracking-wider text-gray-900 dark:text-white uppercase">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <FiPercent className="w-3.5 h-3.5 text-gray-400" /> {coupon.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <FiClock className="w-4 h-4 text-gray-400" /> {new Date(coupon.expireAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon._id)}
                        disabled={isExpired}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border transition-all ${
                          isExpired 
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400' 
                            : coupon.isActive
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                        }`}
                      >
                        {coupon.isActive ? '● Enabled' : '○ Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="inline-flex items-center rounded-full border border-red-500 bg-red-500 px-3 py-2 text-white hover:bg-red-600 transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiTag className="text-primary-500" /> Create New Coupon
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount Percentage</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  min="1"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={expireAt}
                  onChange={(e) => setExpireAt(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
