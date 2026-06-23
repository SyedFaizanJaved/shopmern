import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, disconnectDB } from '../src/config/db';
import { Product } from '../src/models/Product';

const sample = {
  name: 'Blue Cotton T-Shirt',
  description: 'A soft, breathable cotton tee.',
  price: 19.99,
  category: 'clothing',
  stock: 10,
};

describe('Product model', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    await Product.init(); // ensure indexes (incl. unique slug) are built before tests
  });
  afterEach(async () => {
    await Product.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('auto-generates a URL-safe slug from the name', async () => {
    const p = await Product.create(sample);
    expect(p.slug).toBe('blue-cotton-t-shirt');
  });

  it('rejects a negative price (schema min:0)', async () => {
    await expect(Product.create({ ...sample, price: -5 })).rejects.toThrow();
  });

  it('enforces unique slugs (no two products with the same name/slug)', async () => {
    await Product.create(sample);
    await expect(Product.create(sample)).rejects.toThrow();
  });
});
