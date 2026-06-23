import type { Request, Response } from 'express';
import type { HydratedDocument, SortOrder } from 'mongoose';
import type { Product as ProductDTO, ProductSort } from '@app/types';
import { Product, type IProduct } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errors';
import {
  listQuerySchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../validation/product';

// timestamps:true adds these at runtime; expose them for serialization.
type ProductDoc = HydratedDocument<IProduct> & { createdAt: Date; updatedAt: Date };

// Map a Mongoose document → the shared API contract (@app/types Product).
function serialize(p: HydratedDocument<IProduct>): ProductDTO {
  const doc = p as ProductDoc;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    images: p.images,
    category: p.category,
    stock: p.stock,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// A small, readable shape for the filter we build from query params. We cast
// it to the type Product.find expects (Mongoose 9 no longer exports a clean
// FilterQuery type).
interface ProductFilter {
  $text?: { $search: string };
  category?: string;
  price?: { $gte?: number; $lte?: number };
}
type MongoFilter = NonNullable<Parameters<typeof Product.find>[0]>;

// Whitelist of sort options → Mongoose sort specs. A whitelist (never raw
// user input) prevents arbitrary/unsafe sort fields.
const SORT_MAP: Record<ProductSort, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { ratingAvg: -1 },
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((i) => i.message).join(', '), 400);
  }
  const { search, category, minPrice, maxPrice, sort, page, limit } = parsed.data;

  // Build the Mongo filter from the provided params.
  const filter: ProductFilter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const query = filter as MongoFilter;

  // Run the page query and the total count in parallel.
  const [items, total] = await Promise.all([
    Product.find(query).sort(SORT_MAP[sort]).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  res.json({
    items: items.map(serialize),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new AppError('Product not found', 404);
  res.json(serialize(product));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as CreateProductInput;
  const product = await Product.create(data);
  res.status(201).json(serialize(product));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  // Load → assign → save() so document hooks (slug regen) and validators run.
  // (findByIdAndUpdate is a QUERY and would skip pre('validate').)
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  Object.assign(product, req.body as UpdateProductInput);
  await product.save();
  res.json(serialize(product));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(204).end();
});
