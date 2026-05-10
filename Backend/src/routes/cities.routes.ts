import { Router } from 'express';
import { getCities, getCity, getCityActivities } from '../controllers/cities.controller';

const router = Router();
router.get('/', getCities);
router.get('/:id', getCity);
router.get('/:id/activities', getCityActivities);
export default router;
