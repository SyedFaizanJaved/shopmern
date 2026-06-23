export type Role = 'user' | 'admin';

export interface ApiError {
  message: string;
  code?: string;
}

// Shape of a product as returned by the API. Shared by server and client so
// both agree on the contract — the single source of truth.
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductListQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

// Generic paginated response envelope, reusable for any list endpoint.
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
