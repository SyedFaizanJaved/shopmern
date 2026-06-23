import { describe, it, expect, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';

describe('connectDB', () => {
  // Always close the connection so the test process can exit cleanly.
  afterAll(async () => {
    await disconnectDB();
  });

  it('connects to MongoDB and reaches the "connected" ready state', async () => {
    await connectDB('mongodb://localhost:27017/shopmern_test');
    // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    expect(mongoose.connection.readyState).toBe(1);
  });
});
