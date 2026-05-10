import { Router } from 'express';
import { z } from 'zod';
import { getBudget, updateBudget } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';
import { budgetUpdateSchema } from '../validators/trips.validators';

const router = Router();
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
  req.body = result.data;
  next();
};

router.use(authenticate);
router.get('/:tripId/budget', getBudget);
router.put('/:tripId/budget', validate(budgetUpdateSchema), updateBudget);

export default router;
