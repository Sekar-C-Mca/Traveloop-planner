import { Router } from 'express';
import { z } from 'zod';
import { getStops, addStop, updateStop, deleteStop, reorderStops, getStopActivities, addStopActivity, deleteStopActivity } from '../controllers/stops.controller';
import { authenticate } from '../middleware/auth';
import { createStopSchema, updateStopSchema, reorderStopsSchema, stopActivitySchema } from '../validators/trips.validators';

const router = Router();
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
  req.body = result.data;
  next();
};

router.use(authenticate);

// Trip stops
router.get('/:tripId/stops', getStops);
router.post('/:tripId/stops', validate(createStopSchema), addStop);
router.put('/:tripId/stops/:stopId', validate(updateStopSchema), updateStop);
router.delete('/:tripId/stops/:stopId', deleteStop);
router.post('/:tripId/stops/reorder', validate(reorderStopsSchema), reorderStops);

// Stop activities (note: these are mounted at /api/trips/stops/:stopId/activities in app.ts)
router.get('/stops/:stopId/activities', getStopActivities);
router.post('/stops/:stopId/activities', validate(stopActivitySchema), addStopActivity);
router.delete('/stops/:stopId/activities/:id', deleteStopActivity);

export default router;
