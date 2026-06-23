import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/User';

describe('User model', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
  });
  afterEach(async () => {
    await User.deleteMany({}); // keep tests isolated
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('hashes the password on save and never stores plaintext', async () => {
    await User.create({ name: 'Ada', email: 'ada@example.com', password: 'secret123' });

    // password is select:false, so request it explicitly
    const user = await User.findOne({ email: 'ada@example.com' }).select('+password');
    expect(user).not.toBeNull();
    expect(user!.password).not.toBe('secret123');
    expect(user!.password.startsWith('$2')).toBe(true); // bcrypt hashes start with $2
  });

  it('comparePassword returns true for the correct password and false otherwise', async () => {
    await User.create({ name: 'Grace', email: 'grace@example.com', password: 'hopper456' });

    const user = await User.findOne({ email: 'grace@example.com' }).select('+password');
    expect(await user!.comparePassword('hopper456')).toBe(true);
    expect(await user!.comparePassword('wrongpass')).toBe(false);
  });
});
