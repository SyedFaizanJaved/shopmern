import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@app/types';
import { verifyAccessToken } from '../utils/token';
import { AppError } from './errors';

// Augment Express's Request type so `req.user` is known to TypeScript app-wide.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

// Verify the access token from the Authorization header and attach the user.
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice('Bearer '.length);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
}

// Role-based access control: allow only the listed roles. Use AFTER requireAuth.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }
    next();
  };
}
