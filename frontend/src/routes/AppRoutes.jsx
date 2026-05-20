import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const GoogleCallback = lazy(() => import('../pages/GoogleCallback'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const MyOrders = lazy(() => import('../pages/MyOrders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Categories = lazy(() => import('../pages/Categories'));
const Settings = lazy(() => import('../pages/Settings'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminBanners = lazy(() => import('../pages/admin/AdminBanners'));
const AdminCoupons = lazy(() => import('../pages/admin/AdminCoupons'));
const NewCategory = lazy(() => import('../pages/admin/NewCategory'));
const OrderList = lazy(() => import('../pages/admin/OrderList'));
const ProcessOrder = lazy(() => import('../pages/admin/ProcessOrder'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const ProductList = lazy(() => import('../pages/admin/ProductList'));
const NewProduct = lazy(() => import('../pages/admin/NewProduct'));
const EditProduct = lazy(() => import('../pages/admin/EditProduct'));
const ViewProduct = lazy(() => import('../pages/admin/ViewProduct'));
const UserList = lazy(() => import('../pages/admin/UserList'));
const UserDetails = lazy(() => import('../pages/admin/UserDetails'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PremiumLoaderSkeleton = () => (
  <div className="fixed inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6 select-none transition-opacity duration-300">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-32 h-32 rounded-full bg-primary-600/10 dark:bg-primary-400/10 animate-ping duration-1000" />
      <div className="w-20 h-20 rounded-full border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl flex items-center justify-center relative z-10">
        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white animate-pulse">
          V<span className="text-primary-600 dark:text-primary-400">F</span>
        </span>
      </div>
    </div>
    <div className="text-center space-y-1">
      <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white block animate-pulse">
        VogueFlow Architecture
      </span>
      <span className="text-[10px] font-semibold text-gray-400 tracking-wider block">
        Instantiating UI parameters...
      </span>
    </div>
    <div className="w-48 h-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
      <div className="h-full bg-primary-600 dark:bg-primary-400 rounded-full" style={{
        animation: 'vfProgressStream 1.5s infinite ease-in-out'
      }} />
    </div>
    <style>{`
      @keyframes vfProgressStream {
        0% { width: 0%; transform: translateX(-100%); }
        50% { width: 70%; transform: translateX(0%); }
        100% { width: 100%; transform: translateX(200%); }
      }
    `}</style>
  </div>
);

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PremiumLoaderSkeleton />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<ResetPassword />} />
          </Route>

          {/* Public Main & Shopping Routes (No Protection) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="categories" element={<Categories />} />
            <Route path="cart" element={<Cart />} />
            
            {/* Protected User Routes (Require Authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/orders/me" element={<MyOrders />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Admin Tier Boundaries */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductList />} />
              <Route path="/admin/product/new" element={<NewProduct />} />
              <Route path="/admin/product/:id" element={<EditProduct />} />
              <Route path="/admin/product/view/:id" element={<ViewProduct />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/orders" element={<OrderList />} />
              <Route path="/admin/order/:id" element={<ProcessOrder />} />
              <Route path="/admin/users" element={<UserList />} />
              <Route path="/admin/user/:id" element={<UserDetails />} />
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
