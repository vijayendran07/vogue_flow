import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (
    {
      keyword = '',
      currentPage = 1,
      limit,
      price = [0, 250000],
      category = '',
      ratings = 0,
      sort = 'newest',
      brands = [],
      colors = [],
      sizes = [],
      discount = '',
      availability = [],
      materials = [],
      occasions = [],
      gender = '',
      collection = [],
      fit = '',
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.set('keyword', keyword);
      params.set('page', currentPage);
      if (limit) params.set('limit', limit);
      params.set('price[gte]', price[0]);
      params.set('price[lte]', price[1]);
      if (category) params.set('category', category);
      params.set('ratings[gte]', ratings);
      params.set('sort', sort);
      if (brands.length) params.set('brands', brands.join(','));
      if (colors.length) params.set('colors', colors.join(','));
      if (sizes.length) params.set('sizes', sizes.join(','));
      if (discount) params.set('discount', discount);
      if (availability.length) params.set('availability', availability.join(','));
      if (materials.length) params.set('materials', materials.join(','));
      if (occasions.length) params.set('occasions', occasions.join(','));
      if (gender) params.set('gender', gender);
      if (collection.length) params.set('collection', collection.join(','));
      if (fit) params.set('fit', fit);

      const link = `/products?${params.toString()}`;
      const { data } = await api.get(link);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'product/getProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/product/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get product details');
    }
  }
);

export const getAdminProducts = createAsyncThunk(
  'product/getAdminProducts',
  async (
    {
      keyword = '',
      category = '',
      stock = '',
      status = '',
      sort = 'newest',
      page = 1,
      limit = 12,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      let link = `/admin/products?keyword=${keyword}&page=${page}&limit=${limit}&sort=${sort}`;

      if (category) link += `&category=${category}`;
      if (status) link += `&status=${status}`;
      if (stock === 'low') link += '&stock[lte]=4&stock[gt]=0';
      if (stock === 'out') link += '&stock=0';
      if (stock === 'in') link += '&stock[gt]=0';

      const { data } = await api.get(link);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/product/new', productData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/product/${id}`, productData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/product/${id}`);
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const duplicateProduct = createAsyncThunk(
  'product/duplicateProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/admin/product/duplicate/${id}`);
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate product');
    }
  }
);

export const bulkDeleteProducts = createAsyncThunk(
  'product/bulkDeleteProducts',
  async (ids, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/products/bulk-delete`, {
        data: { ids },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete products');
    }
  }
);

export const bulkUpdateProductStatus = createAsyncThunk(
  'product/bulkUpdateProductStatus',
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/products/bulk-status`, { ids, status }, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product status');
    }
  }
);

export const newReview = createAsyncThunk(
  'product/newReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/review', reviewData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

const initialState = {
  products: [],
  product: {},
  loading: false,
  error: null,
  productsCount: 0,
  resultPerPage: 0,
  filteredProductsCount: 0,
  isCreated: false,
  isUpdated: false,
  isDeleted: false,
  isReviewSubmitted: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetProductState: (state) => {
      state.isCreated = false;
      state.isUpdated = false;
      state.isDeleted = false;
      state.isReviewSubmitted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // getProducts
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.productsCount = action.payload.productsCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.filteredProductsCount = action.payload.filteredProductsCount;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getProductDetails
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getAdminProducts
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.productsCount = action.payload.productsCount;
        state.filteredProductsCount = action.payload.filteredProductsCount;
        state.resultPerPage = action.payload.resultPerPage;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.isCreated = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = action.payload;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // duplicateProduct
      .addCase(duplicateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(duplicateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.isCreated = action.payload;
      })
      .addCase(duplicateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // bulkDeleteProducts
      .addCase(bulkDeleteProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = action.payload;
      })
      .addCase(bulkDeleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // bulkUpdateProductStatus
      .addCase(bulkUpdateProductStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(bulkUpdateProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // newReview
      .addCase(newReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(newReview.fulfilled, (state, action) => {
        state.loading = false;
        state.isReviewSubmitted = action.payload;
      })
      .addCase(newReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetProductState } = productSlice.actions;
export default productSlice.reducer;
