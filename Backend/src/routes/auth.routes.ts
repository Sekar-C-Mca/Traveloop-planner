import { Router } from 'express';
import { z } from 'zod';
import { signup, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { signupSchema, loginSchema } from '../validators/auth.validators';

const router = Router();

const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message });
  }
  req.body = result.data;
  next();
};

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
