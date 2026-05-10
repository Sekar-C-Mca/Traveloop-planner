import { Response, NextFunction, Request } from 'express';
import { query } from '../db';
import { createError } from '../middleware/errorHandler';

export const getCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, region, sort, featured, limit = '20', offset = '0' } = req.query as Record<string, string>;
    
    // Build dynamic conditions to allow indexes to be used effectively
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(search);
      conditions.push(`(c.name ILIKE '%' || $${params.length} || '%' OR c.country ILIKE '%' || $${params.length} || '%' OR c.state ILIKE '%' || $${params.length} || '%')`);
    }

    if (region) {
      params.push(region);
      conditions.push(`c.region = $${params.length}`);
    }

    if (featured === 'true') {
      conditions.push(`c.is_featured = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY c.is_featured DESC, c.popularity_score DESC NULLS LAST';
    if (sort === 'cost_asc') orderClause = 'ORDER BY c.cost_index ASC NULLS LAST';
    else if (sort === 'cost_desc') orderClause = 'ORDER BY c.cost_index DESC NULLS LAST';
    else if (sort === 'popularity') orderClause = 'ORDER BY c.is_featured DESC, c.popularity_score DESC NULLS LAST';

    // Get total count (using a subquery or separate call)
    // If no search/filter, we could potentially cache this or use an estimate for 150k+ rows
    const countResult = await query(
      `SELECT COUNT(*)::int as total FROM cities c ${whereClause}`,
      params
    );

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);
    params.push(limitVal, offsetVal);
    
    const result = await query(
      `SELECT * FROM cities c
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
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
