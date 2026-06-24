import { useSearchParams } from 'react-router-dom';
import type { ProductListQuery, ProductSort } from '@app/types';
import { useProducts } from '../features/products/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';

const CATEGORIES = ['clothing', 'home', 'electronics', 'books'];

export function ProductsPage() {
  // The URL is the source of truth for filters → shareable/bookmarkable links.
  const [searchParams, setSearchParams] = useSearchParams();

  const query: ProductListQuery = {
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    sort: (searchParams.get('sort') as ProductSort | null) ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    limit: 12,
  };

  const { data, isLoading, isError } = useProducts(query);

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // any filter change resets to page 1
    setSearchParams(next);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search products…"
          defaultValue={query.search ?? ''}
          onChange={(e) => update('search', e.target.value)}
          className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <select
          value={query.category ?? ''}
          onChange={(e) => update('category', e.target.value)}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={query.sort ?? 'newest'}
          onChange={(e) => update('sort', e.target.value)}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {isLoading && <Spinner />}
      {isError && <p className="text-red-400">Failed to load products.</p>}
      {data && (
        <>
          <p className="mb-4 text-sm text-slate-400">{data.total} products</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
