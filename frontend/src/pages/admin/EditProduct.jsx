import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from '../../components/admin/ProductForm';
import { getProductDetails, updateProduct, clearErrors, resetProductState } from '../../redux/slices/productSlice';
import { getCategories } from '../../redux/slices/categorySlice';

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, product, isUpdated } = useSelector((state) => state.products || {});
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    if (!product || product._id !== id) {
      dispatch(getProductDetails(id));
    }
  }, [dispatch, id, product]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success('Product updated successfully');
      dispatch(resetProductState());
      navigate('/admin/products');
    }
  }, [dispatch, error, isUpdated, navigate]);

  const defaultValues = useMemo(() => {
    if (!product || product._id !== id) {
      return {
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
        variants: [{ size: '', color: '', storage: '', stock: 0, priceDifference: 0 }],
        images: [],
      };
    }

    return {
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      brand: product.brand || '',
      sku: product.sku || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      status: product.status || 'Active',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      variants: product.variants?.length ? product.variants : [{ size: '', color: '', storage: '', stock: 0, priceDifference: 0 }],
      images: product.images || [],
    };
  }, [id, product]);

  const submitHandler = (productData) => {
    dispatch(updateProduct({ id, productData }));
  };

  return (
    <ProductForm
      title="Edit Product"
      submitLabel="Update Product"
      categories={categories}
      defaultValues={defaultValues}
      onSubmit={submitHandler}
      loading={loading}
    />
  );
};

export default EditProduct;
