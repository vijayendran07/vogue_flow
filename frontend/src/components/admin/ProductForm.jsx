import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX, FiChevronUp, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';

const DEFAULT_VARIANT = {
  size: '',
  color: '',
  storage: '',
  stock: 0,
  priceDifference: 0,
};

const ProductForm = ({ title, categories = [], defaultValues = {}, onSubmit, loading, submitLabel }) => {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      brand: '',
      sku: '',
      price: '',
      discountPrice: '',
      stock: '',
      status: 'Active',
      seoTitle: '',
      seoDescription: '',
      variants: [DEFAULT_VARIANT],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const [existingImages, setExistingImages] = useState(defaultValues.images || []);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const sanitized = {
      name: defaultValues.name || '',
      description: defaultValues.description || '',
      category: defaultValues.category?._id || defaultValues.category || '',
      brand: defaultValues.brand || '',
      sku: defaultValues.sku || '',
      price: defaultValues.price ?? '',
      discountPrice: defaultValues.discountPrice ?? '',
      stock: defaultValues.stock ?? '',
      status: defaultValues.status || 'Active',
      seoTitle: defaultValues.seoTitle || '',
      seoDescription: defaultValues.seoDescription || '',
      variants: defaultValues.variants?.length ? defaultValues.variants : [DEFAULT_VARIANT],
    };

    reset(sanitized);
    setExistingImages(defaultValues.images || []);
    setNewImages([]);
  }, [defaultValues, reset]);

  const combinedImages = useMemo(() => (
    [...existingImages.map((image) => ({ src: image.url, existing: true, public_id: image.public_id })), ...newImages.map((src) => ({ src, existing: false }))]
  ), [existingImages, newImages]);

  const maxFiles = Math.max(0, 5 - combinedImages.length);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error('Only JPG, PNG, WEBP files are permitted. Maximum 5 photos.');
    }

    if (acceptedFiles.length === 0) return;

    if (acceptedFiles.length > maxFiles) {
      toast.error('You can upload up to 5 images total.');
      return;
    }

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setNewImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles,
    multiple: true,
  });

  const removeImage = (index) => {
    const existingCount = existingImages.length;

    if (index < existingCount) {
      setExistingImages((old) => old.filter((_, idx) => idx !== index));
      return;
    }

    setNewImages((old) => old.filter((_, idx) => idx !== index - existingCount));
  };

  const reorderImage = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= combinedImages.length) return;

    const updated = [...combinedImages];
    const [moved] = updated.splice(index, 1);
    updated.splice(nextIndex, 0, moved);

    const updatedExisting = updated
      .filter((item) => item.existing)
      .map((item) => ({ url: item.src, public_id: item.public_id }));
    const updatedNew = updated
      .filter((item) => !item.existing)
      .map((item) => item.src);

    setExistingImages(updatedExisting);
    setNewImages(updatedNew);
  };

  const submitHandler = (data) => {
    if (!data.category) {
      toast.error('Please select a category.');
      return;
    }

    const payload = {
      ...data,
      price: Number(data.price),
      discountPrice: Number(data.discountPrice) || 0,
      stock: Number(data.stock),
      variants: data.variants.map((variant) => ({
        size: variant.size || '',
        color: variant.color || '',
        storage: variant.storage || '',
        stock: Number(variant.stock) || 0,
        priceDifference: Number(variant.priceDifference) || 0,
      })),
      images: [...existingImages, ...newImages],
    };

    onSubmit(payload);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Build advanced product listings with SKU, variants, stock controls and SEO metadata.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
            <input {...register('name', { required: true })} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
            {errors.name && <p className="mt-1 text-sm text-red-500">Product name is required.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
            <input {...register('sku')} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
            <input {...register('brand')} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select {...register('category', { required: true })} className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500">
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">Category is required.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
            <input {...register('price', { required: true, min: 0 })} type="number" step="0.01" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
            {errors.price && <p className="mt-1 text-sm text-red-500">Please enter a valid price.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount Price</label>
            <input {...register('discountPrice', { min: 0 })} type="number" step="0.01" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
            <input {...register('stock', { required: true, min: 0 })} type="number" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
            {errors.stock && <p className="mt-1 text-sm text-red-500">Stock amount is required.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select {...register('status')} className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500">
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SEO Title</label>
            <input {...register('seoTitle')} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Description</label>
          <textarea {...register('description', { required: true })} rows="5" className="mt-2 block w-full rounded-3xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-4 focus:ring-2 focus:ring-primary-500" />
          {errors.description && <p className="mt-1 text-sm text-red-500">Product description is required.</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Variants</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add size, color, storage and stock adjustments for each option.</p>
            </div>
            <button type="button" onClick={() => append(DEFAULT_VARIANT)} className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-sm transition hover:bg-primary-700">
              <FiPlus className="w-4 h-4" /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_0.9fr_0.8fr] gap-4 items-end rounded-3xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Size</label>
                  <input {...register(`variants.${index}.size`)} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Color</label>
                  <input {...register(`variants.${index}.color`)} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Storage</label>
                  <input {...register(`variants.${index}.storage`)} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Stock</label>
                  <input {...register(`variants.${index}.stock`, { min: 0 })} type="number" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full">
                    <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Price Diff</label>
                    <input {...register(`variants.${index}.priceDifference`, { min: 0 })} type="number" step="0.01" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2" />
                  </div>
                  <button type="button" onClick={() => remove(index)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Gallery</label>
          <div {...getRootProps()} className="mt-3 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-8 text-center transition hover:border-primary-500 hover:bg-white dark:hover:bg-gray-800 cursor-pointer">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
              <FiUploadCloud className="h-12 w-12" />
              <p className="text-sm font-medium">Drag & drop images here, or click to browse</p>
              <p className="text-sm">JPG, PNG, WEBP up to 5 images.</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {combinedImages.map((image, index) => (
              <div key={`${image.src}-${index}`} className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-sm">
                <img src={image.src} alt={`preview-${index}`} className="h-32 w-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-3 right-3 rounded-full bg-black/70 p-2 text-white hover:bg-black">
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <button type="button" onClick={() => reorderImage(index, -1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white transition">
                    <FiChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => reorderImage(index, 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white transition">
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SEO Meta Title</label>
            <input {...register('seoTitle')} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SEO Meta Description</label>
            <input {...register('seoDescription')} type="text" className="mt-2 block w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-3xl bg-primary-600 px-5 py-4 text-base font-medium text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Saving product...' : submitLabel}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
