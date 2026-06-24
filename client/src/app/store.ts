import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer, { CART_STORAGE_KEY } from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

// Persist the cart to localStorage whenever it changes. store.subscribe runs
// after every dispatched action — a simple way to sync a slice to storage.
store.subscribe(() => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart.items));
  } catch {
    // ignore quota/availability errors
  }
});

// Types inferred from the store itself — single source of truth.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
