import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, name, email, profile_photo_url, language_preference, is_admin, created_at, updated_at
       FROM users WHERE id = $1 AND is_deleted = false`,
      [req.user!.id]
    );
    if (!result.rows[0]) return next(createError(404, 'User not found'));
    res.json({ user: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, profile_photo_url, language_preference } = req.body;
    const result = await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        profile_photo_url = COALESCE($2, profile_photo_url),
        language_preference = COALESCE($3, language_preference),
        updated_at = NOW()
       WHERE id = $4 AND is_deleted = false
       RETURNING id, name, email, profile_photo_url, language_preference, is_admin, created_at, updated_at`,
      [name ?? null, profile_photo_url ?? null, language_preference ?? null, req.user!.id]
    );
    if (!result.rows[0]) return next(createError(404, 'User not found'));
    res.json({ user: result.rows[0] });
  } catch (err) { next(err); }
};

export const getSavedDestinations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT c.* FROM saved_destinations sd
       JOIN cities c ON sd.city_id = c.id
       WHERE sd.user_id = $1
       ORDER BY sd.created_at DESC`,
      [req.user!.id]
    );
    res.json({ cities: result.rows });
  } catch (err) { next(err); }
};

export const saveDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city_id } = req.body;
    await query(
      `INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user!.id, city_id]
    );
    res.json({ message: 'Saved' });
  } catch (err) { next(err); }
};

export const removeDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await query(
      `DELETE FROM saved_destinations WHERE user_id = $1 AND city_id = $2`,
      [req.user!.id, req.params.cityId]
    );
    res.json({ message: 'Removed' });
  } catch (err) { next(err); }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'DELETE') return next(createError(400, 'Type DELETE to confirm'));
    await query(`UPDATE users SET is_deleted = true WHERE id = $1`, [req.user!.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};
