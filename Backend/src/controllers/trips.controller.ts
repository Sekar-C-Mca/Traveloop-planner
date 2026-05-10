import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// GET /api/trips
export const getTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const params: unknown[] = [req.user!.id];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = `AND t.status = $${params.length}`;
    }
    const result = await query(
      `SELECT t.*,
        COUNT(DISTINCT ts.id)::int as stop_count,
        COALESCE(tb.transport_budget + tb.stay_budget + tb.activity_budget + tb.meal_budget + tb.misc_budget, 0) as total_estimated
       FROM trips t
       LEFT JOIN trip_stops ts ON ts.trip_id = t.id
       LEFT JOIN trip_budgets tb ON tb.trip_id = t.id
       WHERE t.user_id = $1 AND t.is_deleted = false ${statusClause}
       GROUP BY t.id, tb.transport_budget, tb.stay_budget, tb.activity_budget, tb.meal_budget, tb.misc_budget
       ORDER BY t.start_date ASC`,
      params
    );
    res.json({ trips: result.rows });
  } catch (err) { next(err); }
};

// POST /api/trips
export const createTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, cover_photo_url, start_date, end_date, currency, total_budget, is_public } = req.body;
    if (start_date > end_date) return next(createError(400, 'start_date must be before end_date'));
    const share_token = crypto.randomBytes(32).toString('hex');
    const result = await query(
      `INSERT INTO trips (user_id, name, description, cover_photo_url, start_date, end_date, currency, total_budget, is_public, share_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.user!.id, name, description ?? null, cover_photo_url ?? null, start_date, end_date, currency ?? 'INR', total_budget ?? null, is_public ?? false, share_token]
    );
    const trip = result.rows[0];
    // Auto-create budget row
    await query(
      `INSERT INTO trip_budgets (trip_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [trip.id]
    );
    res.status(201).json({ trip });
  } catch (err) { next(err); }
};

// GET /api/trips/:id
export const getTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ts.id,
              'city', json_build_object('id', c.id, 'name', c.name, 'country', c.country, 'image_url', c.image_url, 'description', c.description),
              'arrival_date', ts.arrival_date,
              'departure_date', ts.departure_date,
              'order_index', ts.order_index,
              'stay_cost', ts.stay_cost,
              'transport_cost', ts.transport_cost,
              'notes', ts.notes,
              'activities', (
                SELECT COALESCE(json_agg(json_build_object(
                  'id', tsa.id,
                  'activity', json_build_object('id', a.id, 'name', a.name, 'estimated_cost', a.estimated_cost, 'duration_minutes', a.duration_minutes, 'image_url', a.image_url),
                  'scheduled_date', tsa.scheduled_date,
                  'scheduled_time', tsa.scheduled_time,
                  'custom_cost', tsa.custom_cost,
                  'notes', tsa.notes
                ) ORDER BY tsa.scheduled_time NULLS LAST), '[]'::json)
                FROM trip_stop_activities tsa
                JOIN activities a ON tsa.activity_id = a.id
                WHERE tsa.trip_stop_id = ts.id
              )
            ) ORDER BY ts.order_index
          ) FILTER (WHERE ts.id IS NOT NULL), '[]'::json
        ) as stops
       FROM trips t
       LEFT JOIN trip_stops ts ON ts.trip_id = t.id
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE t.id = $1 AND t.is_deleted = false
       GROUP BY t.id`,
      [req.params.id]
    );
    const trip = result.rows[0];
    if (!trip) return next(createError(404, 'Trip not found'));
    if (trip.user_id !== req.user!.id) return next(createError(403, 'Access denied'));
    res.json({ trip });
  } catch (err) { next(err); }
};

// PUT /api/trips/:id
export const updateTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, cover_photo_url, start_date, end_date, total_budget, is_public, status } = req.body;
    const result = await query(
      `UPDATE trips SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        cover_photo_url = COALESCE($3, cover_photo_url),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        total_budget = COALESCE($6, total_budget),
        is_public = COALESCE($7, is_public),
        status = COALESCE($8, status),
        updated_at = NOW()
       WHERE id = $9 AND user_id = $10 AND is_deleted = false
       RETURNING *`,
      [name ?? null, description ?? null, cover_photo_url ?? null, start_date ?? null, end_date ?? null,
       total_budget ?? null, is_public ?? null, status ?? null, req.params.id, req.user!.id]
    );
    if (!result.rows[0]) return next(createError(404, 'Trip not found'));
    res.json({ trip: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/trips/:id
export const deleteTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user!.id]
    );
    if (!result.rows[0]) return next(createError(404, 'Trip not found'));
    res.json({ message: 'Trip deleted' });
  } catch (err) { next(err); }
};
