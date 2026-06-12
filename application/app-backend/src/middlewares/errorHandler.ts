import type { NextFunction, Request, Response } from 'express';

/** Error with an HTTP status; services throw these for expected failures. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err.stack ?? err);
  res.status(500).json({ error: 'Erro interno no servidor' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Rota não encontrada' });
}
