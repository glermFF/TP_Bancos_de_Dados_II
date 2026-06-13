import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.get('/', reviewController.latest);
router.post('/', authenticate, reviewController.create);

export default router;
