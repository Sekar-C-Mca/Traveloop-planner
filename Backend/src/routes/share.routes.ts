import { Router } from 'express';
import { getSharedTrip, copyTrip } from '../controllers/share.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/:token', getSharedTrip);
router.post('/:token/copy', authenticate, copyTrip);
export default router;
