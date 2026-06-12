import { handle } from '../lib/handle';
import * as reviewService from '../services/reviewService';

export const latest = handle((req) => reviewService.latest(Number(req.query.limit)));
export const create = handle((req) => reviewService.create(req.auth!.sub, req.body ?? {}), 201);
