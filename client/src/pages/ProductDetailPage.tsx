import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../features/products/useProducts';
import { Spinner } from '../components/Spinner';
import { useAppDispatch } from '../app/hooks';
import { addItem } from '../features/cart/cartSlice';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const dispatch = useAppDispatch();

  if (isLoading) return <Spinner />;
  if (isError || !product) return <p className="text-red-400">Product not found.</p>;

  return (
    <div>
      <Link to="/" className="text-sm text-emerald-400 hover:underline">
        ← Back to products
      </Link>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-lg bg-slate-800 text-slate-500">
          {product.category}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-slate-400">{product.description}</p>
          <p className="mt-4 text-3xl font-bold text-emerald-400">${product.price.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-400">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() =>
              dispatch(
                addItem({ productId: product.id, name: product.name, price: product.price }),
              )
            }
            className="mt-6 rounded bg-emerald-500 px-6 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
