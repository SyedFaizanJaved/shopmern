import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

export const CART_STORAGE_KEY = 'shopmern_cart';

// Load any previously-saved cart from localStorage (survives page reloads).
function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

const initialState: CartState = { items: loadCart() };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'qty'> & { qty?: number }>) => {
      const { productId, name, price, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) existing.qty += qty;
      else state.items.push({ productId, name, price, qty });
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    setQty: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) item.qty = Math.max(1, action.payload.qty);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
