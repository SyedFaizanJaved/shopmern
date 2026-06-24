import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { clearCredentials } from '../features/auth/authSlice';
import { clearCart } from '../features/cart/cartSlice';
import { logoutRequest } from '../features/auth/authApi';

export function Navbar() {
  const cartCount = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0));
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // even if the network call fails, clear the local session
    }
    dispatch(clearCredentials());
    dispatch(clearCart()); // clear the cart on logout (shared-computer privacy)
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-slate-100">
          Shop<span className="text-emerald-400">MERN</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <Link to="/cart" className="hover:text-emerald-400">
            Cart ({cartCount})
          </Link>
          {user ? (
            <>
              <span className="text-slate-400">Hi, {user.name}</span>
              <button type="button" onClick={handleLogout} className="hover:text-emerald-400">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-emerald-400">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
