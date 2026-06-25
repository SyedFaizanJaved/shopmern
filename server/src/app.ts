import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/errors';
import { stripeWebhook } from './controllers/payment';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';

export function createApp(): Express {
  const app = express();

  // --- Global middleware (runs on every request, in order) ---
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));

  // Stripe webhook needs the RAW request body for signature verification, so it
  // is registered with express.raw BEFORE express.json() (which would consume
  // and transform the body, breaking the signature check).
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json());
  app.use(cookieParser()); // populates req.cookies (needed for refresh token)

  // --- Routes ---
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  // --- Error handling (MUST come AFTER all routes) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
