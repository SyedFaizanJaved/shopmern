import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Product } from '../src/models/Product';
import { Review } from '../src/models/Review';
import { User } from '../src/models/User';
import { makeUserToken } from './helpers/auth';

const app = createApp();

function seedProduct() {
  return Product.create({
    name: 'Reviewed Item',
    description: 'A product to review.',
    price: 10,
    category: 'home',
    stock: 5,
  });
}

describe('review routes', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    await Review.init(); // build the unique compound index before tests
  });
  afterEach(async () => {
    await Review.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('POST a review without a token → 401', async () => {
    const product = await seedProduct();
    const res = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .send({ rating: 5, comment: 'Great' });
    expect(res.status).toBe(401);
  });

  it('creates a review (201) and updates the product rating', async () => {
    const token = await makeUserToken();
    const product = await seedProduct();
    const res = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Nice product' });

    expect(res.status).toBe(201);
    expect(res.body.userName).toBeTruthy();

    const updated = await Product.findById(product.id);
    expect(updated!.ratingCount).toBe(1);
    expect(updated!.ratingAvg).toBe(4);
  });

  it('blocks a second review by the same user → 409', async () => {
    const token = await makeUserToken();
    const product = await seedProduct();
    await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'First' });
    const res = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, comment: 'Second' });
    expect(res.status).toBe(409);
  });

  it('lists reviews for a product (newest first, with author name)', async () => {
    const token = await makeUserToken();
    const product = await seedProduct();
    await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Excellent' });

    const res = await request(app).get(`/api/products/${product.id}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].comment).toBe('Excellent');
    expect(res.body[0].userName).toBeTruthy();
  });
});
