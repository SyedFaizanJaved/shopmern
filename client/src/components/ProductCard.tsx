import { Link } from 'react-router-dom';
import type { Product } from '@app/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group rounded-lg border border-slate-700 bg-slate-800 p-4 transition hover:border-emerald-500"
    >
      <div className="mb-3 flex h-32 items-center justify-center rounded bg-slate-700 text-sm text-slate-500">
        {product.category}
      </div>
      <h3 className="font-semibold text-slate-100 group-hover:text-emerald-400">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{product.description}</p>
      <p className="mt-2 font-bold text-emerald-400">${product.price.toFixed(2)}</p>
    </Link>
  );
}
