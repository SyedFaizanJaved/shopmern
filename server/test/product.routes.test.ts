import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Product } from '../src/models/Product';
import { User } from '../src/models/User';
import { makeAdminToken, makeUserToken } from './helpers/auth';

const app = createApp();
const sample = {
  name: 'Red Ceramic Mug',
  description: 'A sturdy 350ml ceramic mug.',
  price: 9.99,
  category: 'home',
  stock: 5,
};

describe('product write routes (RBAC + CRUD)', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    await Product.init();
  });
  afterEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/products without a token → 401', async () => {
    const res = await request(app).post('/api/products').send(sample);
    expect(res.status).toBe(401);
  });

  it('POST /api/products as a normal user → 403', async () => {
    const token = await makeUserToken();
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(403);
  });

  it('POST /api/products as admin → 201 with a generated slug', async () => {
    const token = await makeAdminToken();
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.slug).toBe('red-ceramic-mug');
  });

  it('PUT /api/products/:id as admin updates fields', async () => {
    const token = await makeAdminToken();
    const created = await Product.create(sample);
    const res = await request(app)
      .put(`/api/products/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 12.5 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(12.5);
  });

  it('DELETE /api/products/:id as admin → 204 and removes it', async () => {
    const token = await makeAdminToken();
    const created = await Product.create(sample);
    const res = await request(app)
      .delete(`/api/products/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
    expect(await Product.findById(created.id)).toBeNull();
  });
});

describe('product list: search / filter / sort / pagination / detail', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    await Product.init();
  });
  beforeEach(async () => {
    await Product.deleteMany({});
    await Product.create([
      { name: 'Blue Shirt', description: 'a cotton shirt', price: 20, category: 'clothing', stock: 5 },
      { name: 'Red Mug', description: 'a ceramic mug', price: 10, category: 'home', stock: 5 },
      { name: 'Green Hat', description: 'a wool hat', price: 30, category: 'clothing', stock: 5 },
      { name: 'Desk Lamp', description: 'a bright lamp', price: 45, category: 'home', stock: 5 },
    ]);
  });
  afterAll(async () => {
    await Product.deleteMany({});
    await disconnectDB();
  });

  it('returns a paginated envelope with defaults', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.page).toBe(1);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=home');
    expect(res.body.total).toBe(2);
  });

  it('filters by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=15&maxPrice=35');
    expect(res.body.total).toBe(2); // Blue Shirt 20, Green Hat 30
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');
    const prices = res.body.items.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('paginates: limit=2 yields 2 items and totalPages=2', async () => {
    const res = await request(app).get('/api/products?limit=2&page=1');
    expect(res.body.items).toHaveLength(2);
    expect(res.body.totalPages).toBe(2);
  });

  it('text-searches name/description', async () => {
    const res = await request(app).get('/api/products?search=mug');
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].name).toBe('Red Mug');
  });

  it('GET /api/products/:slug returns the product', async () => {
    const res = await request(app).get('/api/products/red-mug');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Red Mug');
  });

  it('GET /api/products/:slug for unknown slug → 404', async () => {
    const res = await request(app).get('/api/products/nope-nope');
    expect(res.status).toBe(404);
  });
});
