import type { Product, Paginated, ProductListQuery } from '@app/types';
import { api } from '../../api/client';

// Turn the query object into a clean querystring (skip empty values).
function toParams(q: ProductListQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (q.search) params.search = q.search;
  if (q.category) params.category = q.category;
  if (q.minPrice !== undefined) params.minPrice = String(q.minPrice);
  if (q.maxPrice !== undefined) params.maxPrice = String(q.maxPrice);
  if (q.sort) params.sort = q.sort;
  if (q.page) params.page = String(q.page);
  if (q.limit) params.limit = String(q.limit);
  return params;
}

export async function listProducts(query: ProductListQuery): Promise<Paginated<Product>> {
  const res = await api.get<Paginated<Product>>('/products', { params: toParams(query) });
  return res.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await api.get<Product>(`/products/${slug}`);
  return res.data;
}
