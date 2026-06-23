import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/User';
import { RefreshToken } from '../src/models/RefreshToken';

const app = createApp();

const validUser = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' };

describe('auth routes: register + login', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
  });
  afterEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('registers a new user → 201, returns accessToken, sets httpOnly refresh cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe('ada@example.com');
    expect(res.body.user).not.toHaveProperty('password'); // never leak the hash

    const setCookie = (res.headers['set-cookie'] as unknown as string[]).join(';');
    expect(setCookie).toContain('refreshToken=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('rejects a duplicate email → 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  it('rejects an invalid body (bad email, short password) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials → 200 with accessToken', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('rejects a wrong password → 401', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('auth routes: protected, refresh, logout', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
  });
  afterEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/auth/me without a token → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me with a valid token → 200 and returns the user', async () => {
    const reg = await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('POST /api/auth/refresh issues a new access token from the cookie', async () => {
    const agent = request.agent(app); // agent persists cookies across requests
    await agent.post('/api/auth/register').send(validUser);
    const res = await agent.post('/api/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('POST /api/auth/logout revokes the refresh token (subsequent refresh → 401)', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(204);

    const refreshRes = await agent.post('/api/auth/refresh');
    expect(refreshRes.status).toBe(401);
  });
});
