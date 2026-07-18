import { Router } from 'express';
import authRoutes from './authRoutes';
import distilleryRoutes from './distilleryRoutes';
import reviewRoutes from './reviewRoutes';
import routeRoutes from './routeRoutes';
import * as distilleryController from '../controllers/distilleryController';
import * as communityController from '../controllers/communityController';

const router = Router();
router.use('/auth', authRoutes);
router.use('/distilleries', distilleryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/routes', routeRoutes);
router.get('/stats', distilleryController.stats);
router.get('/communities', communityController.detect);

export default router;
