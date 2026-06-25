import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock the Stripe client so checkout doesn't need a real API key or network.
vi.mock('../src/config/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test_123', client_secret: 'cs_test_123' }),
    },
  },
}));

import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Order } from '../src/models/Order';
import { Product } from '../src/models/Product';
import { User } from '../src/models/User';
import { makeUserToken } from './helpers/auth';

const app = createApp();
const shipping = {
  fullName: 'Ada Lovelace',
  line1: '1 Analytical Way',
  city: 'London',
  postalCode: 'EC1',
  country: 'UK',
};

function seedProduct(overrides: Record<string, unknown> = {}) {
  return Product.create({
    name: 'Test Item',
    description: 'A test product.',
    price: 25,
    category: 'home',
    stock: 10,
    ...overrides,
  });
}

describe('order routes', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    await Product.init();
  });
  afterEach(async () => {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/orders without a token → 401', async () => {
    const res = await request(app).post('/api/orders').send({ items: [], shippingAddress: shipping });
    expect(res.status).toBe(401);
  });

  it('creates a pending order and returns a clientSecret', async () => {
    const token = await makeUserToken();
    const product = await seedProduct();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ product: product.id, qty: 2 }], shippingAddress: shipping });

    expect(res.status).toBe(201);
    expect(res.body.clientSecret).toBe('cs_test_123');
    expect(res.body.order.paymentStatus).toBe('pending');
    expect(res.body.order.totalAmount).toBe(50); // 25 * 2, computed server-side
  });

  it('recomputes the total from the DB (ignores any client-sent price)', async () => {
    const token = await makeUserToken();
    const product = await seedProduct({ price: 25 });
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      // attacker tries to sneak in price: 0.01 — schema strips it; server uses DB price
      .send({ items: [{ product: product.id, qty: 1, price: 0.01 }], shippingAddress: shipping });

    expect(res.body.order.totalAmount).toBe(25);
  });

  it('rejects insufficient stock → 409', async () => {
    const token = await makeUserToken();
    const product = await seedProduct({ stock: 1 });
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ product: product.id, qty: 5 }], shippingAddress: shipping });

    expect(res.status).toBe(409);
  });

  it('lists only the requesting user’s orders', async () => {
    const token = await makeUserToken();
    const product = await seedProduct();
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ product: product.id, qty: 1 }], shippingAddress: shipping });

    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('cannot read another user’s order → 404', async () => {
    const tokenA = await makeUserToken();
    const product = await seedProduct();
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ items: [{ product: product.id, qty: 1 }], shippingAddress: shipping });

    const tokenB = await makeUserToken();
    const res = await request(app)
      .get(`/api/orders/${created.body.order.id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
