import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [usersRes, tripsRes, publicRes, citiesRes] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM users WHERE is_deleted = false'),
      query('SELECT COUNT(*)::int as count FROM trips'),
      query('SELECT COUNT(*)::int as count FROM trips WHERE is_public = true'),
      query(
        `SELECT c.name, COUNT(ts.id)::int as visit_count
         FROM trip_stops ts JOIN cities c ON ts.city_id = c.id
         GROUP BY c.id, c.name ORDER BY visit_count DESC LIMIT 5`
      ),
    ]);
    res.json({
      stats: {
        total_users: usersRes.rows[0].count,
        total_trips: tripsRes.rows[0].count,
        public_trips: publicRes.rows[0].count,
        top_cities: citiesRes.rows,
      },
    });
  } catch (err) { next(err); }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    const [countRes, usersRes] = await Promise.all([
      query('SELECT COUNT(*)::int as total FROM users WHERE is_deleted = false'),
      query(
        `SELECT u.id, u.name, u.email, u.is_admin, u.created_at, COUNT(t.id)::int as trip_count
         FROM users u LEFT JOIN trips t ON t.user_id = u.id
         WHERE u.is_deleted = false
         GROUP BY u.id ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
    ]);
    res.json({ users: usersRes.rows, total: countRes.rows[0].total });
  } catch (err) { next(err); }
};

export const getAdminTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    const [countRes, tripsRes] = await Promise.all([
      query('SELECT COUNT(*)::int as total FROM trips'),
      query(
        `SELECT t.*, u.name as owner_name, COUNT(ts.id)::int as stop_count
         FROM trips t JOIN users u ON t.user_id = u.id
         LEFT JOIN trip_stops ts ON ts.trip_id = t.id
         GROUP BY t.id, u.name ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
    ]);
    res.json({ trips: tripsRes.rows, total: countRes.rows[0].total });
  } catch (err) { next(err); }
};
