import { Router } from 'express';
import { getStats, getUsers, getAdminTrips } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();
router.use(authenticate, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/trips', getAdminTrips);
export default router;
