import { Router } from 'express';
import * as distilleryController from '../controllers/distilleryController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.get('/', distilleryController.list);
router.get('/:id', distilleryController.getById);
router.post('/', authenticate, distilleryController.suggest);

export default router;
