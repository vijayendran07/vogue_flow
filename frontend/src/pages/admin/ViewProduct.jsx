import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductDetails, clearErrors } from '../../redux/slices/productSlice';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency';

const ViewProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, product } = useSelector((state) => state.products || {});

  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
      navigate('/admin/products');
    }
  }, [dispatch, error, navigate]);

  if (!product || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
      </div>
    );
  }

  const stockBadge = product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Low Stock' : 'In Stock';
  const stockBadgeClass = product.stock === 0 ? 'bg-red-500 text-white' : product.stock < 5 ? 'bg-amber-500 text-gray-900' : 'bg-emerald-500 text-white';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">View Product</h1>
          <p className="text-gray-500 dark:text-gray-400">Review the product details, stock status, variants, and pricing information.</p>
        </div>
        <button onClick={() => navigate('/admin/products')} className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          Back to Products
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {product.images?.map((image, idx) => (
              <div key={idx} className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                <img src={image.url} alt={`${product.name}-${idx}`} className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Category</p>
                <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">{product.category?.name || 'Uncategorized'}</p>
              </div>
              <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Status</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${product.status === 'Active' ? 'bg-emerald-500 text-white' : product.status === 'Draft' ? 'bg-sky-500 text-white' : 'bg-gray-500 text-white'}`}>{product.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Stock</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Current inventory and sale pricing.</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${stockBadgeClass}`}>{stockBadge}</span>
            </div>

            <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.discountPrice ? formatCurrency(product.discountPrice) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stock Quantity</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.stock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SKU</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.sku || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Variants</h3>
            <div className="mt-4 space-y-3">
              {product.variants?.length ? product.variants.map((variant, idx) => (
                <div key={idx} className="rounded-3xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-950">
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span><strong>Size:</strong> {variant.size || '—'}</span>
                    <span><strong>Color:</strong> {variant.color || '—'}</span>
                    <span><strong>Storage:</strong> {variant.storage || '—'}</span>
                    <span><strong>Stock:</strong> {variant.stock}</span>
                    <span><strong>Diff:</strong> {variant.priceDifference ? formatCurrency(variant.priceDifference) : '—'}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500 dark:text-gray-400">No variants added.</p>}
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO</h3>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Title</p>
                <p>{product.seoTitle || 'Not configured'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Description</p>
                <p>{product.seoDescription || 'Not configured'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
