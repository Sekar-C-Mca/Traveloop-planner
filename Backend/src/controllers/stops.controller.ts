import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// Helper to verify trip ownership
const verifyTripOwnership = async (tripId: string, userId: string): Promise<boolean> => {
  const result = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2 AND is_deleted = false', [tripId, userId]);
  return result.rows.length > 0;
};

// GET /api/trips/:tripId/stops
export const getStops = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const result = await query(
      `SELECT ts.*, c.name as city_name, c.country, c.image_url, c.description as city_description
       FROM trip_stops ts JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1 ORDER BY ts.order_index`,
      [req.params.tripId]
    );
    res.json({ stops: result.rows });
  } catch (err) { next(err); }
};

// POST /api/trips/:tripId/stops
export const addStop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { city_id, arrival_date, departure_date, stay_cost, transport_cost, notes } = req.body;
    const maxIdx = await query('SELECT COALESCE(MAX(order_index), -1) + 1 as next_idx FROM trip_stops WHERE trip_id = $1', [req.params.tripId]);
    const order_index = maxIdx.rows[0].next_idx;
    const result = await query(
      `INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, stay_cost, transport_cost, notes, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.tripId, city_id, arrival_date, departure_date, stay_cost ?? 0, transport_cost ?? 0, notes ?? null, order_index]
    );
    res.status(201).json({ stop: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/trips/:tripId/stops/:stopId
export const updateStop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { arrival_date, departure_date, stay_cost, transport_cost, notes, order_index } = req.body;
    const result = await query(
      `UPDATE trip_stops SET
        arrival_date = COALESCE($1, arrival_date),
        departure_date = COALESCE($2, departure_date),
        stay_cost = COALESCE($3, stay_cost),
        transport_cost = COALESCE($4, transport_cost),
        notes = COALESCE($5, notes),
        order_index = COALESCE($6, order_index)
       WHERE id = $7 AND trip_id = $8 RETURNING *`,
      [arrival_date ?? null, departure_date ?? null, stay_cost ?? null, transport_cost ?? null, notes ?? null, order_index ?? null, req.params.stopId, req.params.tripId]
    );
    if (!result.rows[0]) return next(createError(404, 'Stop not found'));
    res.json({ stop: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/trips/:tripId/stops/:stopId
export const deleteStop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const result = await query('DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2 RETURNING id', [req.params.stopId, req.params.tripId]);
    if (!result.rows[0]) return next(createError(404, 'Stop not found'));
    res.json({ message: 'Stop removed' });
  } catch (err) { next(err); }
};

// POST /api/trips/:tripId/stops/reorder
export const reorderStops = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const owned = await verifyTripOwnership(req.params.tripId, req.user!.id);
    if (!owned) return next(createError(403, 'Access denied'));
    const { order } = req.body as { order: { id: number; order_index: number }[] };
    for (const item of order) {
      await query('UPDATE trip_stops SET order_index = $1 WHERE id = $2 AND trip_id = $3', [item.order_index, item.id, req.params.tripId]);
    }
    res.json({ message: 'Reordered' });
  } catch (err) { next(err); }
};

// GET /api/trips/stops/:stopId/activities
export const getStopActivities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT tsa.*, a.name, a.estimated_cost, a.duration_minutes, a.image_url, ac.name as category_name
       FROM trip_stop_activities tsa
       JOIN activities a ON tsa.activity_id = a.id
       LEFT JOIN activity_categories ac ON a.category_id = ac.id
       WHERE tsa.trip_stop_id = $1
       ORDER BY tsa.scheduled_time NULLS LAST`,
      [req.params.stopId]
    );
    res.json({ activities: result.rows });
  } catch (err) { next(err); }
};

// POST /api/trips/stops/:stopId/activities
export const addStopActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { activity_id, scheduled_date, scheduled_time, custom_cost, notes } = req.body;
    const result = await query(
      `INSERT INTO trip_stop_activities (trip_stop_id, activity_id, scheduled_date, scheduled_time, custom_cost, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.stopId, activity_id, scheduled_date ?? null, scheduled_time ?? null, custom_cost ?? null, notes ?? null]
    );
    res.status(201).json({ activity: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/trips/stops/:stopId/activities/:id
export const deleteStopActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await query('DELETE FROM trip_stop_activities WHERE id = $1 AND trip_stop_id = $2', [req.params.id, req.params.stopId]);
    res.json({ message: 'Activity removed' });
  } catch (err) { next(err); }
};
