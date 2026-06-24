import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { useAuthBootstrap } from './features/auth/useAuthBootstrap';
import { Spinner } from './components/Spinner';

function App() {
  // Try to restore the session from the httpOnly refresh cookie before rendering.
  const ready = useAuthBootstrap();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Spinner label="Starting…" />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="*" element={<p className="text-slate-400">Page not found.</p>} />
      </Route>
    </Routes>
  );
}

export default App;
