import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/errors';

export function createApp(): Express {
  const app = express();

  // --- Global middleware (runs on every request, in order) ---
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  // --- Routes ---
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // --- Error handling (MUST come AFTER all routes) ---
  app.use(notFound); // no route matched → 404
  app.use(errorHandler); // anything that threw / called next(err) → JSON error

  return app;
}
