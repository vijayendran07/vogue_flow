import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminBanners, createBanner, updateBanner, deleteBanner, clearErrors } from '../../redux/slices/bannerSlice';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Upload, Image, CheckCircle, XCircle } from 'lucide-react';

const AdminBanners = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { banners, error, loading } = useSelector((state) => state.banners);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('');
  const [brands, setBrands] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [bgImagePreview, setBgImagePreview] = useState('');
  const [active, setActive] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getAdminBanners());
  }, [dispatch]);

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
    setTitle('');
    setSubtitle('');
    setTag('');
    setBrands('');
    setBgImage('');
    setBgImagePreview('');
    setActive(true);
    setIsEditing(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();

    if (!isEditing && !bgImage) {
      toast.error('Banner background image is required');
      return;
    }

    // Default title to pass database schemas safely, with all tags and brands omitted
    const bannerData = { 
      title: 'Campaign Hero Banner', 
      subtitle: '', 
      tag: '', 
      brands: '', 
      active 
    };
    
    if (bgImage) {
      bannerData.bgImage = bgImage;
    }

    if (isEditing) {
      dispatch(updateBanner({ id: editId, bannerData })).then((res) => {
        if (!res.error) {
          toast.success('Banner updated successfully');
          resetForm();
        }
      });
    } else {
      dispatch(createBanner(bannerData)).then((res) => {
        if (!res.error) {
          toast.success('Banner created successfully');
          resetForm();
        }
      });
    }
  };

  const handleEditClick = (banner) => {
    setIsEditing(true);
    setEditId(banner._id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setTag(banner.tag || '');
    setBrands(banner.brands || '');
    setBgImagePreview(banner.bgImage?.url || '');
    setBgImage('');
    setActive(banner.active !== undefined ? banner.active : true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this banner? This cannot be undone.")) {
      dispatch(deleteBanner(id)).then((res) => {
        if (!res.error) {
          toast.success("Banner deleted successfully");
          if (editId === id) resetForm();
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Image className="text-primary-500 w-8 h-8" /> Home Page Banners
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Add, edit and manage carousel marketing banners shown on the user's home screen.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Banner Form */}
        <div className="w-full lg:w-5/12 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl h-max transition-all duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isEditing ? 'Modify Banner' : 'New Banner'}
            </h2>
            {isEditing && (
              <button 
                onClick={resetForm}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleCreateOrUpdate} className="space-y-5">

            <div className="flex items-center gap-6 py-2 border-y border-gray-100 dark:border-gray-800 my-4">
              <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex-1">Banner Visibility</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActive(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    active 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200' 
                      : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setActive(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    !active 
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200' 
                      : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Custom Banner Image Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Banner Background Image</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-all bg-gray-50 dark:bg-gray-800 shadow-inner"
                  >
                    <Upload className="w-4 h-4" /> Choose Banner Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
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
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Clear Image
                    </button>
                  )}
                </div>

                {bgImagePreview && (
                  <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
                    <img src={bgImagePreview} alt="Banner Preview" className="w-full h-full object-cover animate-fade-in" />
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest py-4 px-4 rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> {loading ? (isEditing ? 'Saving Changes...' : 'Uploading Banner...') : (isEditing ? 'Save Banner' : 'Publish Banner')}
            </button>
          </form>
        </div>

        {/* Banner List */}
        <div className="w-full lg:w-7/12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Active & Hidden Banners</h2>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[700px] hide-scrollbar">
            {banners && banners.length > 0 ? (
              banners.map((banner) => (
                <div key={banner._id} className="relative group bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                  {/* Aspect Ratio Box for Image */}
                  <div className="w-full aspect-[21/9] relative overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {banner.bgImage?.url ? (
                      <img src={banner.bgImage.url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1">
                      {banner.active ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white py-1 px-2.5 rounded-full shadow">
                          <CheckCircle className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white py-1 px-2.5 rounded-full shadow">
                          <XCircle className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Banner Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                        Campaign Banner
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        ID: {banner._id}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800 mt-4 pt-3">
                      <button 
                        onClick={() => handleEditClick(banner)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-gray-850 py-1.5 px-3 rounded-lg border border-gray-250/20 shadow-sm transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(banner._id)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-850 py-1.5 px-3 rounded-lg border border-gray-250/20 shadow-sm transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                No hero banners published.
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/10 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Published: {banners?.length || 0}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminBanners;
