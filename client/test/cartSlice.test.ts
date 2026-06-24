import { describe, it, expect } from 'vitest';
import cartReducer, {
  addItem,
  removeItem,
  setQty,
  clearCart,
} from '../src/features/cart/cartSlice';

const base = { productId: 'p1', name: 'Mug', price: 10 };

describe('cartSlice reducer', () => {
  it('adds a new item with default qty 1', () => {
    const state = cartReducer(undefined, addItem(base));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ productId: 'p1', qty: 1 });
  });

  it('increments qty when the same product is added again', () => {
    let state = cartReducer(undefined, addItem(base));
    state = cartReducer(state, addItem(base));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(2);
  });

  it('setQty clamps the quantity to a minimum of 1', () => {
    let state = cartReducer(undefined, addItem(base));
    state = cartReducer(state, setQty({ productId: 'p1', qty: 0 }));
    expect(state.items[0].qty).toBe(1);
  });

  it('removeItem removes the matching product', () => {
    let state = cartReducer(undefined, addItem(base));
    state = cartReducer(state, removeItem('p1'));
    expect(state.items).toHaveLength(0);
  });

  it('clearCart empties the cart', () => {
    let state = cartReducer(undefined, addItem(base));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
  });
});
