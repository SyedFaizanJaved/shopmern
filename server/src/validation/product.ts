import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.number().nonnegative('Price must be >= 0'),
  category: z.string().trim().min(1, 'Category is required'),
  images: z.array(z.string()).default([]),
  stock: z.number().int().nonnegative().default(0),
});

// Update allows any subset of the create fields (PATCH-like semantics on PUT).
export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Query params arrive as STRINGS — coerce numbers, apply safe defaults, and
// cap `limit` so a client can never request unbounded data.
export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
