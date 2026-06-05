import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag, FiX, FiAlertCircle, FiEdit } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form/Image states
  const [code, setCode] = useState('VOGUESAVE');
  const [discountPercentage, setDiscountPercentage] = useState('25');
  const [expireAt, setExpireAt] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [bgImagePreview, setBgImagePreview] = useState('');
  const [editCouponId, setEditCouponId] = useState(null);
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
        toast.success(`Coupon visibility updated!`);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("File size should be less than 8MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result);
        setBgImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCode('VOGUESAVE');
    setDiscountPercentage('25');
    setExpireAt('');
    setBgImage('');
    setBgImagePreview('');
    setEditCouponId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    // Default expiry: 1 year from now
    setExpireAt(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditCouponId(coupon._id);
    setCode(coupon.code || 'VOGUESAVE');
    setDiscountPercentage(coupon.discountPercentage || '25');
    setExpireAt(coupon.expireAt ? coupon.expireAt.split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setBgImagePreview(coupon.bgImage?.url || '');
    setBgImage('');
    setModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!editCouponId && !bgImage) {
      return toast.error('Coupon banner image is required!');
    }

    setSubmitting(true);
    try {
      // Programmatically set code, discount rate, and expiration to pass MongoDB schemas
      const payload = {
        code: code.trim().toUpperCase() || 'VOGUESAVE',
        discountPercentage: Number(discountPercentage) || 25,
        expireAt: expireAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      if (bgImage) {
        payload.bgImage = bgImage;
      }

      if (editCouponId) {
        const { data } = await api.put(`/admin/coupon/${editCouponId}`, payload);
        if (data.success) {
          toast.success('Coupon banner updated successfully!');
          fetchCoupons();
          setModalOpen(false);
        }
      } else {
        const { data } = await api.post('/admin/coupon/new', payload);
        if (data.success) {
          toast.success('Coupon banner created successfully!');
          fetchCoupons();
          setModalOpen(false);
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon banner');
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
              <FiTag className="text-primary-500" /> Coupon Banners
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage the visual campaign banners shown in the coupon segment of the homepage.
            </p>
          </div>

          <div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-white shadow-sm hover:bg-primary-700 transition font-bold text-sm"
            >
              <FiPlus className="w-4 h-4" /> Upload Coupon Banner
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-6 bg-white dark:bg-gray-900 border border-gray-150/60 dark:border-gray-800 rounded-3xl shadow-sm"><Skeleton height={140} /></div>
          ))
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700">
            <FiAlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            No coupon banners uploaded yet. Create your first visual banner to get started!
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon._id} className="relative group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
              {/* Aspect Ratio Box for Image */}
              <div className="w-full aspect-[25/8] relative overflow-hidden bg-gray-200 dark:bg-gray-800 border-b border-gray-150/20">
                {coupon.bgImage?.url ? (
                  <img src={coupon.bgImage.url} alt="Coupon Banner" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {coupon.isActive ? (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white py-1 px-2.5 rounded-full shadow">
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-gray-500 text-white py-1 px-2.5 rounded-full shadow">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-black text-gray-955 dark:text-white uppercase tracking-tight mb-1">
                    {coupon.code}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">
                    <span>Discount:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">{coupon.discountPercentage}% OFF</span>
                  </div>
                  <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold">
                    Expires: {new Date(coupon.expireAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-850/10 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleToggleActive(coupon._id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                    coupon.isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200' 
                      : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Disabled'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(coupon)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-500 transition-colors bg-white dark:bg-gray-800"
                  >
                    <FiEdit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors bg-white dark:bg-gray-800"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl animate-fade-in animate-duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiTag className="text-primary-500" /> {editCouponId ? 'Modify Coupon Banner' : 'Upload New Coupon Banner'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Coupon Code Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VOGUESAVE"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Discount Percentage Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Expiration Date Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={expireAt}
                  onChange={(e) => setExpireAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Custom Image Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Coupon Banner Graphic</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => document.getElementById('coupon-file-input')?.click()}
                      className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-all bg-gray-50 dark:bg-gray-800 shadow-inner"
                    >
                      Choose Banner Image
                    </button>
                    <input 
                      id="coupon-file-input"
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {bgImagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setBgImage('');
                          setBgImagePreview('');
                        }}
                        className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>

                  {bgImagePreview && (
                    <div className="relative w-full aspect-[25/8] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
                      <img src={bgImagePreview} alt="Coupon Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-primary-600 py-3.5 text-xs uppercase tracking-widest font-black text-white hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editCouponId ? 'Save Changes' : 'Publish Banner')}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 py-3.5 text-xs uppercase tracking-widest font-black text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
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
