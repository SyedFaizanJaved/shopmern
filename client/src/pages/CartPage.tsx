import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { removeItem, setQty, clearCart } from '../features/cart/cartSlice';

export function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <p className="text-slate-400">
        Your cart is empty.{' '}
        <Link to="/" className="text-emerald-400 hover:underline">
          Browse products
        </Link>
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between rounded border border-slate-700 bg-slate-800 p-3"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-400">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) =>
                  dispatch(setQty({ productId: item.productId, qty: Number(e.target.value) }))
                }
                className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => dispatch(removeItem(item.productId))}
                className="text-sm text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="text-sm text-slate-400 hover:text-red-400"
        >
          Clear cart
        </button>
        <p className="text-xl font-bold">
          Total: <span className="text-emerald-400">${total.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
