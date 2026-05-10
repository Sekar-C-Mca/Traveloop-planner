import { Router } from 'express';
import { z } from 'zod';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth';
import { noteCreateSchema, noteUpdateSchema } from '../validators/misc.validators';

const router = Router();
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
  req.body = result.data;
  next();
};

router.use(authenticate);
router.get('/:tripId/notes', getNotes);
router.post('/:tripId/notes', validate(noteCreateSchema), createNote);
router.put('/:tripId/notes/:noteId', validate(noteUpdateSchema), updateNote);
router.delete('/:tripId/notes/:noteId', deleteNote);
export default router;
