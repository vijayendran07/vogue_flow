import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import analyticsReducer from './slices/analyticsSlice';
import wishlistReducer from './slices/wishlistSlice';
import adminUserReducer from './slices/userAdminSlice';
import bannerReducer from './slices/bannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    order: orderReducer,
    analytics: analyticsReducer,
    wishlist: wishlistReducer,
    adminUsers: adminUserReducer,
    banners: bannerReducer,
  },
});
