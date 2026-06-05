import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { loadUser } from './redux/slices/authSlice';
import { getWishlistFromDB } from './redux/slices/wishlistSlice';
import { getDBCart } from './redux/slices/cartSlice';

import { HelmetProvider } from 'react-helmet-async';
import AuthModal from './components/auth/AuthModal';

function App() {
  useEffect(() => {
    store.dispatch(loadUser()).then((res) => {
      // If user loads successfully, hydrate account cart/wishlist from DB
      if (res.payload) {
        store.dispatch(getDBCart());
        store.dispatch(getWishlistFromDB());
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthModal />
          <AppRoutes />
          <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Toaster position="top-right" />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
