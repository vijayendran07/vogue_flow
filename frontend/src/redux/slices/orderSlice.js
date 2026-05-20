import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (order, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/order/new', order);
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create order');
        }
    }
);

export const myOrders = createAsyncThunk(
    'order/myOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/orders/me');
            return data.orders;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get orders');
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    'order/getOrderDetails',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/order/${id}`);
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get order details');
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async ({ id, cancelReason }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/order/${id}/cancel`, { cancelReason });
            return data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
        }
    }
);

export const getAllOrders = createAsyncThunk(
    'order/getAllOrders',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await api.get(`/orders${query ? `?${query}` : ''}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get all orders');
        }
    }
);

export const updateOrder = createAsyncThunk(
    'order/updateOrder',
    async ({ id, status, note, cancelReason, refundStatus }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/orders/${id}/status`, { status, note, cancelReason, refundStatus });
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update order');
        }
    }
);

export const updateShipping = createAsyncThunk(
    'order/updateShipping',
    async ({ id, courier, trackingNumber, estimatedDeliveryDate, shippingStatus, note }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/orders/${id}/shipping`, { courier, trackingNumber, estimatedDeliveryDate, shippingStatus, note });
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update shipping details');
        }
    }
);

export const generateInvoice = createAsyncThunk(
    'order/generateInvoice',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/orders/${id}/invoice`);
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
        }
    }
);

export const bulkUpdateOrders = createAsyncThunk(
    'order/bulkUpdateOrders',
    async ({ ids, status }, { rejectWithValue }) => {
        try {
            const { data } = await api.put('/orders/bulk', { ids, status });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update orders in bulk');
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'order/deleteOrder',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/orders/${id}`);
            return data.success;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        order: {},
        totalAmount: 0,
        page: 1,
        pages: 1,
        count: 0,
        loading: false,
        isUpdated: false,
        isDeleted: false,
        isCancelled: false,
        isInvoiceGenerated: false,
        bulkUpdateSuccess: false,
        error: null,
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        resetOrderState: (state) => {
            state.isUpdated = false;
            state.isDeleted = false;
            state.isCancelled = false;
            state.isInvoiceGenerated = false;
            state.bulkUpdateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // createOrder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // myOrders
            .addCase(myOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(myOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(myOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // getOrderDetails
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // cancelOrder
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.isCancelled = true;
                state.order.orderStatus = 'Cancelled';
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // getAllOrders
            .addCase(getAllOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.totalAmount = action.payload.totalAmount;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.count = action.payload.count;
            })
            .addCase(getAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // updateOrder
            .addCase(updateOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.isUpdated = true;
                state.order = action.payload;
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // updateShipping
            .addCase(updateShipping.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateShipping.fulfilled, (state, action) => {
                state.loading = false;
                state.isUpdated = true;
                state.order = action.payload;
            })
            .addCase(updateShipping.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // generateInvoice
            .addCase(generateInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(generateInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.isInvoiceGenerated = true;
                state.order = action.payload;
            })
            .addCase(generateInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // bulkUpdateOrders
            .addCase(bulkUpdateOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(bulkUpdateOrders.fulfilled, (state) => {
                state.loading = false;
                state.bulkUpdateSuccess = true;
            })
            .addCase(bulkUpdateOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // deleteOrder
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.isDeleted = action.payload;
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearErrors, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
