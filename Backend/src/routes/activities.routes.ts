import { Router } from 'express';
import { getActivities, getCategories } from '../controllers/activities.controller';

const router = Router();
router.get('/', getActivities);
router.get('/categories', getCategories);
export default router;
