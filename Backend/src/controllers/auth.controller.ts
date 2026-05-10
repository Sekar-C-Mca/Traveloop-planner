import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { SignupInput, LoginInput } from '../validators/auth.validators';

export const signup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as SignupInput;

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return next(createError(409, 'Email already registered', 'EMAIL_EXISTS'));
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
       RETURNING id, name, email, profile_photo_url, language_preference, is_admin, created_at`,
      [name, email, password_hash]
    );
    const user = result.rows[0];

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return next(createError(401, 'Invalid credentials'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const { password_hash: _ph, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, name, email, profile_photo_url, language_preference, is_admin, created_at, updated_at
       FROM users WHERE id = $1 AND is_deleted = false`,
      [req.user!.id]
    );
    if (!result.rows[0]) {
      return next(createError(404, 'User not found'));
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
