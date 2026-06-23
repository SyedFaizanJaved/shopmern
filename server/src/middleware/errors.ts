import type { Request, Response, NextFunction } from 'express';

// A custom error that carries an HTTP status code. Throw this anywhere in the
// app (e.g. `throw new AppError('Product not found', 404)`) and the central
// errorHandler will translate it into the right HTTP response.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// Runs when no route matched the request → 404.
export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: `Not found - ${req.method} ${req.originalUrl}` });
}

// Central error handler. The 4-argument signature is REQUIRED — that is how
// Express recognizes this as error-handling middleware. Must be registered LAST.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  if (statusCode >= 500) {
    console.error(err); // log server-side faults for debugging
  }
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
}
