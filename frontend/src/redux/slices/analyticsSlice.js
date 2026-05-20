import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getAdminAnalytics = createAsyncThunk(
    'analytics/getAdminAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/admin/analytics');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get analytics');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        data: {},
        loading: false,
        error: null,
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAdminAnalytics.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getAdminAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearErrors } = analyticsSlice.actions;
export default analyticsSlice.reducer;
