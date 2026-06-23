import { Schema, model } from 'mongoose';
import { slugify } from '../utils/slugify';

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Derive the slug from the name before validation (so `required` passes) —
// whenever the name changes or the slug is missing.
productSchema.pre('validate', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
});

// --- Indexes ---
// Full-text index over name + description → powers `$text` search.
productSchema.index({ name: 'text', description: 'text' });
// Compound index: serves filtering/sorting by category, and by category+price.
// (A compound index also satisfies queries on its left-most prefix → category alone.)
productSchema.index({ category: 1, price: 1 });

export const Product = model<IProduct>('Product', productSchema);
