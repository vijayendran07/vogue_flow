import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProducts, deleteProduct, duplicateProduct, bulkDeleteProducts, bulkUpdateProductStatus, clearErrors, resetProductState } from '../../redux/slices/productSlice';
import { getCategories } from '../../redux/slices/categorySlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiCopy, FiDownload, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { utils, writeFile } from 'xlsx';
import Skeleton from 'react-loading-skeleton';
import api from '../../services/api';

const ProductList = () => {
  const dispatch = useDispatch();
  const { loading, error, products, isDeleted, isUpdated } = useSelector((state) => state.products || {});
  const { categories } = useSelector((state) => state.categories);

  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Active');

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isDeleted) {
      toast.success('Product deleted successfully');
      dispatch(resetProductState());
    }
    if (isUpdated) {
      toast.success('Product list updated successfully');
      dispatch(resetProductState());
    }
  }, [dispatch, error, isDeleted, isUpdated]);

  useEffect(() => {
    dispatch(getAdminProducts({ keyword, category: categoryFilter, stock: stockFilter, status: statusFilter, sort }));
    dispatch(getCategories());
  }, [dispatch, keyword, categoryFilter, stockFilter, statusFilter, sort, isDeleted, isUpdated]);

  const selectedCount = selectedIds.length;

  const handleSelectToggle = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === (products?.length || 0)) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(products?.map((product) => product._id) || []);
  };

  const deleteProductHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const duplicateProductHandler = (id) => {
    if (window.confirm('Duplicate this product?')) {
      dispatch(duplicateProduct(id));
    }
  };

  const handleToggleTrending = async (product) => {
    try {
      const { data } = await api.put(`/admin/product/${product._id}`, {
        isTrending: !product.isTrending
      });
      if (data.success) {
        toast.success('Product trending status updated successfully!');
        dispatch(getAdminProducts({ keyword, category: categoryFilter, stock: stockFilter, status: statusFilter, sort }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle trending state');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      return toast.error('Select products to delete.');
    }
    if (window.confirm('Delete selected products?')) {
      dispatch(bulkDeleteProducts(selectedIds));
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = () => {
    if (selectedIds.length === 0) {
      return toast.error('Select products to update status.');
    }
    dispatch(bulkUpdateProductStatus({ ids: selectedIds, status: bulkStatus }));
    setSelectedIds([]);
  };

  const exportToExcel = () => {
    if (!products || products.length === 0) {
      return toast.error('No products available to export.');
    }

    const worksheet = utils.json_to_sheet(
      products.map((product) => ({
        ID: product._id,
        Name: product.name,
        Category: product.category?.name || 'N/A',
        Brand: product.brand || 'N/A',
        SKU: product.sku || 'N/A',
        Status: product.status,
        Trending: product.isTrending ? 'Yes' : 'No',
        Price: product.price,
        DiscountPrice: product.discountPrice || 0,
        Stock: product.stock,
        CreatedAt: new Date(product.createdAt).toLocaleDateString(),
      }))
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Products');
    writeFile(workbook, 'admin_products_export.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Manage product inventory, filter by category and status, and run bulk actions.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/admin/product/new" className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-white shadow-sm hover:bg-primary-700 transition">
              <FiPlus className="w-5 h-5" /> New Product
            </Link>
            <button onClick={exportToExcel} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
              <FiDownload className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Search</label>
            <div className="mt-3 flex items-center gap-2 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
              <FiSearch className="text-gray-400" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search products..." className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 outline-none" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-3 block w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Stock</label>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="mt-3 block w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-3 block w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Selected</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{selectedCount}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Sort</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-3 block w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Price: High to Low</option>
              <option value="lowest">Price: Low to High</option>
            </select>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Bulk Status</p>
            <div className="mt-3 flex items-center gap-2">
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="flex-1 rounded-3xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Hidden">Hidden</option>
              </select>
              <button type="button" onClick={handleBulkStatusUpdate} className="inline-flex items-center rounded-3xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 shadow-sm">
          <button type="button" onClick={handleSelectAll} className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 transition">
            {selectedIds.length === (products?.length || 0) ? <FiCheckSquare /> : <FiSquare />} Select All
          </button>
          <button type="button" onClick={handleBulkDelete} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition">
            <FiTrash2 /> Delete Selected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Select</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trending</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 8 }).map((_, cell) => (
                    <td key={cell} className="px-6 py-5"><Skeleton height={24} /></td>
                  ))}
                </tr>
              ))
            ) : products && products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">No products found for the current filters.</td>
              </tr>
            ) : (
              products?.map((product) => {
                const lowStock = product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Low Stock' : 'In Stock';
                const badgeClass = product.stock === 0 ? 'bg-red-500 text-white' : product.stock < 5 ? 'bg-amber-500 text-gray-900' : 'bg-emerald-500 text-white';

                return (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => handleSelectToggle(product._id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={product.name} className="h-12 w-12 rounded-2xl object-cover border border-gray-200 dark:border-gray-700" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{lowStock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleTrending(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                          product.isTrending
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm shadow-amber-500/10'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-750 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                      >
                        {product.isTrending ? '★ Trending' : '☆ Standard'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{product.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/admin/product/view/${product._id}`} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 transition">
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link to={`/admin/product/${product._id}`} className="inline-flex items-center rounded-full border border-primary-600 bg-primary-50 px-3 py-2 text-primary-700 hover:bg-primary-100 transition dark:bg-primary-500/10 dark:text-primary-300">
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button type="button" onClick={() => duplicateProductHandler(product._id)} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 transition">
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => deleteProductHandler(product._id)} className="inline-flex items-center rounded-full border border-red-500 bg-red-500 px-3 py-2 text-white hover:bg-red-600 transition">
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
    </div>
  );
};

export default ProductList;
