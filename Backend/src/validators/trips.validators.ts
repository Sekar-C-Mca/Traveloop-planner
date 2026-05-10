import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  description: z.string().optional(),
  cover_photo_url: z.string().url().optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  currency: z.string().default('INR'),
  total_budget: z.number().positive().optional(),
  is_public: z.boolean().default(false),
});

export const updateTripSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  cover_photo_url: z.string().url().optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  total_budget: z.number().positive().optional().nullable(),
  is_public: z.boolean().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
});

export const createStopSchema = z.object({
  city_id: z.number().int().positive(),
  arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stay_cost: z.number().min(0).default(0),
  transport_cost: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const updateStopSchema = z.object({
  arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  stay_cost: z.number().min(0).optional(),
  transport_cost: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  order_index: z.number().int().min(0).optional(),
});

export const reorderStopsSchema = z.object({
  order: z.array(z.object({
    id: z.number().int().positive(),
    order_index: z.number().int().min(0),
  })),
});

export const stopActivitySchema = z.object({
  activity_id: z.number().int().positive(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduled_time: z.string().optional().nullable(),
  custom_cost: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const budgetUpdateSchema = z.object({
  transport_budget: z.number().min(0).optional(),
  stay_budget: z.number().min(0).optional(),
  activity_budget: z.number().min(0).optional(),
  meal_budget: z.number().min(0).optional(),
  misc_budget: z.number().min(0).optional(),
  currency: z.string().optional(),
});
