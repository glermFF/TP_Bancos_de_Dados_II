import type { NextFunction, Request, Response } from 'express';
import { ApiError } from './errorHandler';

/** In-memory fixed-window rate limiter (per client IP). */
export function rateLimit(maxRequests: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > maxRequests) {
      next(new ApiError(429, 'Muitas tentativas. Aguarde um minuto e tente de novo.'));
      return;
    }
    next();
  };
}
