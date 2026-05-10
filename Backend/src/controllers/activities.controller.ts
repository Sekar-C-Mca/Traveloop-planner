import { Response, NextFunction, Request } from 'express';
import { query } from '../db';

export const getActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city_id, category_id, min_cost, max_cost, is_popular } = req.query as Record<string, string>;
    const params: unknown[] = [];
    const conditions: string[] = [];
    if (city_id) { params.push(parseInt(city_id)); conditions.push(`a.city_id = $${params.length}`); }
    if (category_id) { params.push(parseInt(category_id)); conditions.push(`a.category_id = $${params.length}`); }
    if (min_cost) { params.push(parseFloat(min_cost)); conditions.push(`a.estimated_cost >= $${params.length}`); }
    if (max_cost) { params.push(parseFloat(max_cost)); conditions.push(`a.estimated_cost <= $${params.length}`); }
    if (is_popular === 'true') conditions.push('a.is_popular = true');
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT a.*, ac.name as category_name, c.name as city_name FROM activities a
       LEFT JOIN activity_categories ac ON a.category_id = ac.id
       LEFT JOIN cities c ON a.city_id = c.id
       ${whereClause}
       ORDER BY a.is_popular DESC, a.name ASC`,
      params
    );
    res.json({ activities: result.rows });
  } catch (err) { next(err); }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query('SELECT * FROM activity_categories ORDER BY name');
    res.json({ categories: result.rows });
  } catch (err) { next(err); }
};
