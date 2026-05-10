import { Response, NextFunction } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tripCheck = await query('SELECT id, start_date, end_date FROM trips WHERE id = $1 AND user_id = $2 AND is_deleted = false', [req.params.tripId, req.user!.id]);
    if (!tripCheck.rows[0]) return next(createError(404, 'Trip not found'));
    const trip = tripCheck.rows[0];

    const budgetResult = await query('SELECT * FROM trip_budgets WHERE trip_id = $1', [req.params.tripId]);
    const budget = budgetResult.rows[0] || {};

    const stayTransport = await query(
      `SELECT COALESCE(SUM(stay_cost + transport_cost), 0) as total FROM trip_stops WHERE trip_id = $1`,
      [req.params.tripId]
    );
    const activityCost = await query(
      `SELECT COALESCE(SUM(COALESCE(tsa.custom_cost, a.estimated_cost)), 0) as total
       FROM trip_stop_activities tsa
       JOIN activities a ON tsa.activity_id = a.id
       JOIN trip_stops ts ON tsa.trip_stop_id = ts.id
       WHERE ts.trip_id = $1`,
      [req.params.tripId]
    );

    const totalBudgeted = (budget.transport_budget || 0) + (budget.stay_budget || 0) + (budget.activity_budget || 0) + (budget.meal_budget || 0) + (budget.misc_budget || 0);
    const totalEstimated = parseFloat(stayTransport.rows[0].total) + parseFloat(activityCost.rows[0].total);
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    res.json({
      budget,
      summary: {
        total_budgeted: totalBudgeted,
        total_estimated: totalEstimated,
        difference: totalBudgeted - totalEstimated,
        per_day_estimate: totalEstimated / days,
        actual_stay_transport: parseFloat(stayTransport.rows[0].total),
        actual_activity_cost: parseFloat(activityCost.rows[0].total),
      },
    });
  } catch (err) { next(err); }
};

export const updateBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tripCheck = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2 AND is_deleted = false', [req.params.tripId, req.user!.id]);
    if (!tripCheck.rows[0]) return next(createError(404, 'Trip not found'));
    const { transport_budget, stay_budget, activity_budget, meal_budget, misc_budget, currency } = req.body;
    const result = await query(
      `UPDATE trip_budgets SET
        transport_budget = COALESCE($1, transport_budget),
        stay_budget = COALESCE($2, stay_budget),
        activity_budget = COALESCE($3, activity_budget),
        meal_budget = COALESCE($4, meal_budget),
        misc_budget = COALESCE($5, misc_budget),
        currency = COALESCE($6, currency),
        updated_at = NOW()
       WHERE trip_id = $7 RETURNING *`,
      [transport_budget ?? null, stay_budget ?? null, activity_budget ?? null, meal_budget ?? null, misc_budget ?? null, currency ?? null, req.params.tripId]
    );
    res.json({ budget: result.rows[0] });
  } catch (err) { next(err); }
};
