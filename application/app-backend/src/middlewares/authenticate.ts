import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './errorHandler';

export interface AuthPayload {
  sub: string; // user id
  username: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

/** Requires a valid `Authorization: Bearer <token>` header. */
export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Token de autenticação ausente'));
    return;
  }
  try {
    const decoded = jwt.verify(header.slice('Bearer '.length), env.jwtSecret) as jwt.JwtPayload;
    req.auth = { sub: String(decoded.sub), username: String(decoded.username) };
    next();
  } catch {
    next(new ApiError(401, 'Token inválido ou expirado'));
  }
}
