import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { logoutUser } from './authSlice';

// Sync local wishlist with backend and fetch full details
export const syncWishlist = createAsyncThunk(
    'wishlist/syncWishlist',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            // Items may be full product objects or just IDs
            const wishlistItems = state.wishlist.wishlistItems.map(item =>
                typeof item === 'object' ? item._id : item
            ).filter(Boolean);
            
            const { data } = await api.post('/wishlist/sync', { wishlistItems });
            
            return data.wishlist;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to sync wishlist');
        }
    }
);

// Fetch wishlist from backend without merging local guest items
export const getWishlistFromDB = createAsyncThunk(
    'wishlist/getWishlistFromDB',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/wishlist/sync', { wishlistItems: [] });
            return data.wishlist;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get wishlist');
        }
    }
);

export const clearWishlistDB = createAsyncThunk(
    'wishlist/clearWishlistDB',
    async (_, { rejectWithValue }) => {
        try {
            await api.delete('/wishlist/clear');
            return [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
        }
    }
);

// Add to wishlist
export const addToWishlistThunk = createAsyncThunk(
    'wishlist/addToWishlist',
    async (product, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            
            if (auth.isAuthenticated) {
                await api.post('/wishlist/add', { productId: product._id });
            }
            
            return product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
        }
    }
);

// Remove from wishlist
export const removeFromWishlistThunk = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            
            if (auth.isAuthenticated) {
                await api.delete(`/wishlist/remove/${productId}`);
            }
            
            return productId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
        }
    }
);

const initialState = {
    wishlistItems: localStorage.getItem('wishlistItems')
        ? JSON.parse(localStorage.getItem('wishlistItems'))
        : [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlistErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(syncWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(syncWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlistItems = action.payload;
                localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
            })
            .addCase(syncWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getWishlistFromDB.pending, (state) => {
                state.loading = true;
            })
            .addCase(getWishlistFromDB.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlistItems = action.payload;
                localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
            })
            .addCase(getWishlistFromDB.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(clearWishlistDB.fulfilled, (state) => {
                state.wishlistItems = [];
                localStorage.setItem('wishlistItems', JSON.stringify([]));
            })
            .addCase(addToWishlistThunk.fulfilled, (state, action) => {
                const item = action.payload;
                const isItemExist = state.wishlistItems.find((i) => i._id === item._id);

                if (!isItemExist) {
                    state.wishlistItems.push(item);
                    localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
                }
            })
            .addCase(removeFromWishlistThunk.fulfilled, (state, action) => {
                state.wishlistItems = state.wishlistItems.filter((i) => i._id !== action.payload);
                localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.wishlistItems = [];
                state.loading = false;
                state.error = null;
                localStorage.setItem('wishlistItems', JSON.stringify([]));
            });
    },
});

export const { clearWishlistErrors } = wishlistSlice.actions;
export default wishlistSlice.reducer;
