import { Router } from 'express';
import { z } from 'zod';
import { getTrips, createTrip, getTrip, updateTrip, deleteTrip } from '../controllers/trips.controller';
import { authenticate } from '../middleware/auth';
import { createTripSchema, updateTripSchema } from '../validators/trips.validators';

const router = Router();
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
  req.body = result.data;
  next();
};

router.use(authenticate);
router.get('/', getTrips);
router.post('/', validate(createTripSchema), createTrip);
router.get('/:id', getTrip);
router.put('/:id', validate(updateTripSchema), updateTrip);
router.delete('/:id', deleteTrip);

export default router;
