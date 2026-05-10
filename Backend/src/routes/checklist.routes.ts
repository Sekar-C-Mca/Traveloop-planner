import { Router } from 'express';
import { z } from 'zod';
import { getChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem, resetChecklist } from '../controllers/checklist.controller';
import { authenticate } from '../middleware/auth';
import { checklistItemSchema, checklistToggleSchema } from '../validators/misc.validators';

const router = Router();
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
  req.body = result.data;
  next();
};

router.use(authenticate);
router.get('/:tripId/checklist', getChecklist);
router.post('/:tripId/checklist', validate(checklistItemSchema), addChecklistItem);
router.patch('/:tripId/checklist/:itemId', validate(checklistToggleSchema), toggleChecklistItem);
router.delete('/:tripId/checklist/:itemId', deleteChecklistItem);
router.post('/:tripId/checklist/reset', resetChecklist);
export default router;
