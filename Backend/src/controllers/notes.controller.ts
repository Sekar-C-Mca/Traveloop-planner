import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const verifyTripOwnership = async (tripId: string, userId: string): Promise<boolean> => {
  const result = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2 AND is_deleted = false', [tripId, userId]);
  return result.rows.length > 0;
};

export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const result = await query(
      `SELECT tn.*, c.name as city_name FROM trip_notes tn
       LEFT JOIN trip_stops ts ON tn.trip_stop_id = ts.id
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE tn.trip_id = $1 ORDER BY tn.created_at DESC`,
      [req.params.tripId]
    );
    res.json({ notes: result.rows });
  } catch (err) { next(err); }
};

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { content, trip_stop_id } = req.body;
    const result = await query(
      `INSERT INTO trip_notes (trip_id, content, trip_stop_id) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.tripId, content, trip_stop_id ?? null]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { content } = req.body;
    const result = await query(
      `UPDATE trip_notes SET content = $1, updated_at = NOW() WHERE id = $2 AND trip_id = $3 RETURNING *`,
      [content, req.params.noteId, req.params.tripId]
    );
    if (!result.rows[0]) return next(createError(404, 'Note not found'));
    res.json({ note: result.rows[0] });
  } catch (err) { next(err); }
};

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    await query('DELETE FROM trip_notes WHERE id = $1 AND trip_id = $2', [req.params.noteId, req.params.tripId]);
    res.json({ message: 'Note deleted' });
  } catch (err) { next(err); }
};
