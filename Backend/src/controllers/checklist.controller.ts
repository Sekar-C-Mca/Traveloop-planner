import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const verifyTripOwnership = async (tripId: string, userId: string): Promise<boolean> => {
  const result = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2 AND is_deleted = false', [tripId, userId]);
  return result.rows.length > 0;
};

export const getChecklist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { category } = req.query as Record<string, string>;
    const params: unknown[] = [req.params.tripId];
    let categoryClause = '';
    if (category) { params.push(category); categoryClause = `AND category = $${params.length}`; }
    const result = await query(
      `SELECT * FROM packing_checklist WHERE trip_id = $1 ${categoryClause} ORDER BY category NULLS LAST, created_at`,
      params
    );
    const items = result.rows;
    const total = items.length;
    const packed = items.filter((i: any) => i.is_packed).length;
    res.json({ items, stats: { total, packed, percentage: total ? Math.round((packed / total) * 100) : 0 } });
  } catch (err) { next(err); }
};

export const addChecklistItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { item_name, category } = req.body;
    const result = await query(
      `INSERT INTO packing_checklist (trip_id, item_name, category) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.tripId, item_name, category ?? null]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (err) { next(err); }
};

export const toggleChecklistItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { is_packed } = req.body;
    const result = await query(
      `UPDATE packing_checklist SET is_packed = $1 WHERE id = $2 AND trip_id = $3 RETURNING *`,
      [is_packed, req.params.itemId, req.params.tripId]
    );
    if (!result.rows[0]) return next(createError(404, 'Item not found'));
    res.json({ item: result.rows[0] });
  } catch (err) { next(err); }
};

export const deleteChecklistItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    await query('DELETE FROM packing_checklist WHERE id = $1 AND trip_id = $2', [req.params.itemId, req.params.tripId]);
    res.json({ message: 'Item removed' });
  } catch (err) { next(err); }
};

export const resetChecklist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    await query('UPDATE packing_checklist SET is_packed = false WHERE trip_id = $1', [req.params.tripId]);
    res.json({ message: 'Checklist reset' });
  } catch (err) { next(err); }
};
