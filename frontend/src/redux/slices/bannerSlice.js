import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getBanners = createAsyncThunk(
  'banners/getBanners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/banners');
      return data.banners;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners');
    }
  }
);

export const getAdminBanners = createAsyncThunk(
  'banners/getAdminBanners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/banners');
      return data.banners;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin banners');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async (bannerData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/banner/new', bannerData);
      return data.banner;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/banner/${id}`, bannerData);
      return data.banner;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/banner/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner');
    }
  }
);

const initialState = {
  banners: [],
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getBanners
      .addCase(getBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getAdminBanners
      .addCase(getAdminBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(getAdminBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createBanner
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.unshift(action.payload); // place new banners at the top
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateBanner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteBanner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(b => b._id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors } = bannerSlice.actions;
export default bannerSlice.reducer;
