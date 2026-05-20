import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { logoutUser } from './authSlice';

const getLocalCart = () => {
    let cart = localStorage.getItem('cartItems');
    if (cart) {
        return JSON.parse(cart);
    }
    return [];
};

export const updateCartDB = createAsyncThunk(
    'cart/updateCartDB',
    async (cartItems, { rejectWithValue }) => {
        try {
            const { data } = await api.put('/cart/update', { cartItems });
            return data.cart.cartItems;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
        }
    }
);

export const getDBCart = createAsyncThunk(
    'cart/getDBCart',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/cart');
            return data.cart.cartItems;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get cart');
        }
    }
);

export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async (code, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/coupon/apply', { code });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
        }
    }
);

const initialState = {
    cartItems: getLocalCart(),
    loading: false,
    error: null,
    subTotal: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    discountPercentage: 0,
    couponCode: '',
    shippingInfo: localStorage.getItem('shippingInfo') ? JSON.parse(localStorage.getItem('shippingInfo')) : {},
};

const calculateTotals = (state) => {
    const subtotal = state.cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 50; // free over ₹1000
    const discount = (subtotal * state.discountPercentage) / 100;
    
    state.subTotal = subtotal;
    state.taxPrice = tax;
    state.shippingPrice = shipping;
    state.totalPrice = subtotal + tax + shipping - discount;
    
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const isItemExist = state.cartItems.find((i) => i.product === item.product);

            if (isItemExist) {
                state.cartItems = state.cartItems.map((i) =>
                    i.product === isItemExist.product ? item : i
                );
            } else {
                state.cartItems.push(item);
            }
            calculateTotals(state);
        },
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter((i) => i.product !== action.payload);
            calculateTotals(state);
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.discountPercentage = 0;
            state.couponCode = '';
            calculateTotals(state);
        },
        calculateCartTotals: (state) => {
            calculateTotals(state);
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem('shippingInfo', JSON.stringify(action.payload));
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateCartDB.fulfilled, (state, action) => {
                state.cartItems = action.payload;
                calculateTotals(state);
            })
            .addCase(getDBCart.fulfilled, (state, action) => {
                state.cartItems = action.payload;
                calculateTotals(state);
            })
            .addCase(applyCoupon.fulfilled, (state, action) => {
                state.discountPercentage = action.payload.discountPercentage;
                state.couponCode = action.payload.couponCode;
                calculateTotals(state);
            })
            .addCase(applyCoupon.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.cartItems = [];
                state.loading = false;
                state.error = null;
                state.discountPercentage = 0;
                state.couponCode = '';
                calculateTotals(state);
            });
    },
});

export const { addToCart, removeCartItem, clearCart, calculateCartTotals, saveShippingInfo } = cartSlice.actions;
export default cartSlice.reducer;
