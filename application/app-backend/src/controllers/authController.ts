import { handle } from '../lib/handle';
import * as authService from '../services/authService';

export const register = handle((req) => authService.register(req.body ?? {}), 201);
export const login = handle((req) => authService.login(req.body ?? {}));
export const me = handle((req) => authService.getProfile(req.auth!.sub));
