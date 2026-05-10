import { Router } from 'express';
import { z } from 'zod';
import { getProfile, updateProfile, getSavedDestinations, saveDestination, removeDestination, deleteAccount } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { updateUserSchema, savedDestinationSchema } from '../validators/users.validators';

const router = Router();

const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message });
  }
  req.body = result.data;
  next();
};

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', validate(updateUserSchema), updateProfile);
router.get('/me/saved-destinations', getSavedDestinations);
router.post('/me/saved-destinations', validate(savedDestinationSchema), saveDestination);
router.delete('/me/saved-destinations/:cityId', removeDestination);
router.delete('/me', deleteAccount);

export default router;
