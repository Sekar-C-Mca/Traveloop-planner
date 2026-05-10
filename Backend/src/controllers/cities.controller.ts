import { Response, NextFunction, Request } from 'express';
import { query } from '../db';
import { createError } from '../middleware/errorHandler';

export const getCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, region, sort, featured, limit = '20', offset = '0' } = req.query as Record<string, string>;
    const params: unknown[] = [search || null, region || null, featured === 'true' ? true : null];

    let orderClause = 'ORDER BY c.is_featured DESC, c.popularity_score DESC NULLS LAST';
    if (sort === 'cost_asc') orderClause = 'ORDER BY c.cost_index ASC NULLS LAST';
    else if (sort === 'cost_desc') orderClause = 'ORDER BY c.cost_index DESC NULLS LAST';
    else if (sort === 'popularity') orderClause = 'ORDER BY c.is_featured DESC, c.popularity_score DESC NULLS LAST';

    const countResult = await query(
      `SELECT COUNT(*)::int as total FROM cities c
       WHERE ($1::text IS NULL OR c.name ILIKE '%' || $1 || '%' OR c.country ILIKE '%' || $1 || '%' OR c.state ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR c.region = $2)
       AND ($3::boolean IS NULL OR c.is_featured = $3)`,
      params
    );

    params.push(parseInt(limit), parseInt(offset));
    const result = await query(
      `SELECT * FROM cities c
       WHERE ($1::text IS NULL OR c.name ILIKE '%' || $1 || '%' OR c.country ILIKE '%' || $1 || '%' OR c.state ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR c.region = $2)
       AND ($3::boolean IS NULL OR c.is_featured = $3)
       ${orderClause}
       LIMIT $4 OFFSET $5`,
      params
    );
    res.json({ cities: result.rows, total: countResult.rows[0].total });
  } catch (err) { next(err); }
};

export const getCity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query('SELECT * FROM cities WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return next(createError(404, 'City not found'));
    res.json({ city: result.rows[0] });
  } catch (err) { next(err); }
};

export const getCityActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category_id, min_cost, max_cost, duration_max } = req.query as Record<string, string>;
    const params: unknown[] = [req.params.id];
    const conditions: string[] = ['a.city_id = $1'];
    if (category_id) { params.push(parseInt(category_id)); conditions.push(`a.category_id = $${params.length}`); }
    if (min_cost) { params.push(parseFloat(min_cost)); conditions.push(`a.estimated_cost >= $${params.length}`); }
    if (max_cost) { params.push(parseFloat(max_cost)); conditions.push(`a.estimated_cost <= $${params.length}`); }
    if (duration_max) { params.push(parseInt(duration_max)); conditions.push(`a.duration_minutes <= $${params.length}`); }
    const result = await query(
      `SELECT a.*, ac.name as category_name FROM activities a
       LEFT JOIN activity_categories ac ON a.category_id = ac.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.is_popular DESC, a.name ASC`,
      params
    );
    res.json({ activities: result.rows });
  } catch (err) { next(err); }
};
