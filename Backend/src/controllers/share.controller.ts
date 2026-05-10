import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getSharedTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT t.*, u.name as owner_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ts.id,
              'city', json_build_object('id', c.id, 'name', c.name, 'country', c.country, 'image_url', c.image_url),
              'arrival_date', ts.arrival_date,
              'departure_date', ts.departure_date,
              'order_index', ts.order_index,
              'activities', (
                SELECT COALESCE(json_agg(json_build_object(
                  'id', tsa.id,
                  'activity', json_build_object('id', a.id, 'name', a.name, 'estimated_cost', a.estimated_cost, 'duration_minutes', a.duration_minutes),
                  'scheduled_date', tsa.scheduled_date,
                  'scheduled_time', tsa.scheduled_time
                ) ORDER BY tsa.scheduled_time NULLS LAST), '[]'::json)
                FROM trip_stop_activities tsa JOIN activities a ON tsa.activity_id = a.id
                WHERE tsa.trip_stop_id = ts.id
              )
            ) ORDER BY ts.order_index
          ) FILTER (WHERE ts.id IS NOT NULL), '[]'::json
        ) as stops
       FROM trips t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN trip_stops ts ON ts.trip_id = t.id
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE t.share_token = $1 AND t.is_public = true AND u.is_deleted = false
       GROUP BY t.id, u.name`,
      [req.params.token]
    );
    const trip = result.rows[0];
    if (!trip) return next(createError(404, 'Trip not found or is not public'));

    // Log view (best effort — don't fail if table doesn't exist)
    try {
      await query(
        `INSERT INTO shared_trip_views (trip_id, viewer_ip) VALUES ($1, $2)`,
        [trip.id, req.ip]
      );
    } catch { /* ignore */ }

    res.json({ trip });
  } catch (err) { next(err); }
};

export const copyTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Find original trip
    const origResult = await query(
      `SELECT t.* FROM trips t WHERE t.share_token = $1 AND t.is_public = true`,
      [req.params.token]
    );
    const original = origResult.rows[0];
    if (!original) return next(createError(404, 'Trip not found'));

    const newToken = crypto.randomBytes(32).toString('hex');
    // Clone trip
    const newTrip = await query(
      `INSERT INTO trips (user_id, name, description, cover_photo_url, start_date, end_date, currency, total_budget, is_public, share_token, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,'upcoming') RETURNING *`,
      [req.user!.id, `${original.name} (Copy)`, original.description, original.cover_photo_url,
       original.start_date, original.end_date, original.currency, original.total_budget, newToken]
    );
    const trip = newTrip.rows[0];

    // Clone budget
    const origBudget = await query('SELECT * FROM trip_budgets WHERE trip_id = $1', [original.id]);
    if (origBudget.rows[0]) {
      const b = origBudget.rows[0];
      await query(
        `INSERT INTO trip_budgets (trip_id, transport_budget, stay_budget, activity_budget, meal_budget, misc_budget, currency)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [trip.id, b.transport_budget, b.stay_budget, b.activity_budget, b.meal_budget, b.misc_budget, b.currency]
      );
    } else {
      await query(`INSERT INTO trip_budgets (trip_id) VALUES ($1)`, [trip.id]);
    }

    // Clone stops + activities
    const stops = await query('SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index', [original.id]);
    for (const stop of stops.rows) {
      const newStop = await query(
        `INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, stay_cost, transport_cost, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [trip.id, stop.city_id, stop.arrival_date, stop.departure_date, stop.order_index, stop.stay_cost, stop.transport_cost, stop.notes]
      );
      const activities = await query('SELECT * FROM trip_stop_activities WHERE trip_stop_id = $1', [stop.id]);
      for (const act of activities.rows) {
        await query(
          `INSERT INTO trip_stop_activities (trip_stop_id, activity_id, scheduled_date, scheduled_time, custom_cost, notes)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [newStop.rows[0].id, act.activity_id, act.scheduled_date, act.scheduled_time, act.custom_cost, act.notes]
        );
      }
    }

    // Log copy (best effort)
    try {
      await query(
        `INSERT INTO trip_copies (original_trip_id, copied_by_user_id, new_trip_id) VALUES ($1,$2,$3)`,
        [original.id, req.user!.id, trip.id]
      );
    } catch { /* ignore */ }

    res.status(201).json({ trip, message: 'Trip copied to your account!' });
  } catch (err) { next(err); }
};
