import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/errors';
import authRoutes from './routes/auth';

export function createApp(): Express {
  const app = express();

  // --- Global middleware (runs on every request, in order) ---
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser()); // populates req.cookies (needed for refresh token)

  // --- Routes ---
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.use('/api/auth', authRoutes);

  // --- Error handling (MUST come AFTER all routes) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
