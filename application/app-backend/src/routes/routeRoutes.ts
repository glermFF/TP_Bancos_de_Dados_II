import { Router } from 'express';
import * as routeController from '../controllers/routeController';

const router = Router();

router.post('/solve', routeController.solve);

export default router;
