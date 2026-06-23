import express, { type Express } from 'express';
import cors from 'cors';

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? '*', credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
