import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, clearErrors as clearProductErrors, resetProductState } from '../../redux/slices/productSlice';
import { getCategories, clearErrors as clearCategoryErrors } from '../../redux/slices/categorySlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from '../../components/admin/ProductForm';

const NewProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isCreated } = useSelector((state) => state.products || {});
  const { categories, error: categoryError } = useSelector((state) => state.categories);

  const defaultValues = useMemo(() => ({
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
  }), []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
    if (categoryError) {
      toast.error(categoryError);
      dispatch(clearCategoryErrors());
    }
    if (isCreated) {
      toast.success('Product created successfully');
      dispatch(resetProductState());
      navigate('/admin/products');
    }
  }, [dispatch, error, categoryError, isCreated, navigate]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const submitHandler = (productData) => {
    dispatch(createProduct(productData));
  };

  return (
    <ProductForm
      title="Create New Product"
      submitLabel="Create Product"
      categories={categories}
      defaultValues={defaultValues}
      onSubmit={submitHandler}
      loading={loading}
    />
  );
};

export default NewProduct;
