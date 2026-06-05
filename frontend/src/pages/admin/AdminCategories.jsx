import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, createCategory, updateCategory, deleteCategory, clearErrors } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Upload, FolderOpen } from 'lucide-react';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { categories, error, loading } = useSelector((state) => state.categories);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setParentCategory('');
    setImage('');
    setImagePreview('');
    setIsEditing(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const categoryData = { name, description };
    if (parentCategory) {
      categoryData.parentCategory = parentCategory;
    } else {
      categoryData.parentCategory = null;
    }
    if (image) {
      categoryData.image = image;
    }

    if (isEditing) {
      dispatch(updateCategory({ id: editId, categoryData })).then((res) => {
        if (!res.error) {
          toast.success('Category updated successfully');
          resetForm();
        }
      });
    } else {
      dispatch(createCategory(categoryData)).then((res) => {
        if (!res.error) {
          toast.success('Category created successfully');
          resetForm();
        }
      });
    }
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditId(category._id);
    setName(category.name || '');
    setDescription(category.description || '');
    setParentCategory(category.parentCategory?._id || category.parentCategory || '');
    setImagePreview(category.image?.url || '');
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category? All associated subcategories or product definitions might fail to delete unless cleared first.")) {
      dispatch(deleteCategory(id)).then((res) => {
        if (!res.error) {
          toast.success("Category deleted successfully");
          if (editId === id) resetForm();
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <FolderOpen className="text-primary-500 w-8 h-8" /> Category Manager
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Configure homepage visual bubbles and catalogue segments.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Create / Edit Form */}
        <div className="w-full lg:w-5/12 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl h-max transition-all duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isEditing ? 'Modify Category' : 'Add Category'}
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
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Category Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Kurta Sets, Jeans, Shirts"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm font-semibold placeholder-gray-400 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Description</label>
              <textarea 
                rows="3"
                placeholder="Brief category context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm font-semibold placeholder-gray-400 transition-all shadow-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Parent Category (Optional)</label>
              <select 
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="block w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm font-bold transition-all shadow-sm"
              >
                <option value="">None (Top-Level Category)</option>
                {categories?.filter(c => c._id !== editId).map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Custom Premium File Upload */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Category Bubble Photo</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-all bg-gray-50 dark:bg-gray-800 shadow-inner shrink-0"
                >
                  <Upload className="w-4 h-4" /> Select Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary-500 shadow-md">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImage('');
                        setImagePreview('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No photo selected</span>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest py-4 px-4 rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Category' : 'Create Category')}
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="w-full lg:w-7/12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Registered Categories</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-gray-800/40">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Photo</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Segment</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800 bg-transparent">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
                          {category.image?.url ? (
                            <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800">
                              N/A
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {category.parentCategory ? (
                          <span className="bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-lg">
                            {category.parentCategory.name || 'Subcategory'}
                          </span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1 rounded-lg">
                            Top Level
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(category)}
                            className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-950/40 rounded-xl transition-all"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category._id)}
                            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 rounded-xl transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/10 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Count: {categories?.length || 0}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCategories;
