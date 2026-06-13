import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/authenticate';

type HandlerFn = (req: AuthenticatedRequest) => Promise<unknown>;

export const handle = (fn: HandlerFn, status = 200) =>
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(status).json(await fn(req));
  };
