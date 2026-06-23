import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { AppError } from './errors';

// Generic validation middleware: runs a Zod schema against req.body. On
// failure it throws a 400 AppError (caught by the central errorHandler). On
// success it REPLACES req.body with the parsed/normalized data (trimmed,
// lowercased email, etc.), so handlers receive clean, typed input.
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      throw new AppError(message, 400);
    }
    req.body = result.data;
    next();
  };
}
