import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/authenticate';

type HandlerFn = (req: AuthenticatedRequest) => Promise<unknown>;

// Express 5 forwards rejected promises to the error middleware.
export const handle = (fn: HandlerFn, status = 200) =>
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(status).json(await fn(req));
  };
