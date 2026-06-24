import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ProductListQuery } from '@app/types';
import { listProducts, getProductBySlug } from './productsApi';

// List products. The queryKey includes the query object, so React Query caches
// each filter combination separately and refetches when filters change.
export function useProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData, // keep old page visible while next loads
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug), // don't run until we have a slug
  });
}
