import type { RequestHandler, Request, Response, NextFunction } from 'express';

// Wraps an async route handler so any rejected promise is forwarded to
// Express's error middleware via next(err) — instead of being swallowed.
// Express 4 does NOT catch errors from async handlers automatically.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
