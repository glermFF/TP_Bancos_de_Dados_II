import { handle } from '../lib/handle';
import * as routeService from '../services/routeService';

export const solve = handle((req) => routeService.solveRoute(req.body ?? {}));
