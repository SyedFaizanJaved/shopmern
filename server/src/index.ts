import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';

async function start(): Promise<void> {
  await connectDB(env.MONGO_URI);
  createApp().listen(env.PORT, () => {
    console.log(`🚀 API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
