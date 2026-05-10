import { z } from 'zod';

export const checklistItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  category: z.string().optional(),
});

export const checklistToggleSchema = z.object({
  is_packed: z.boolean(),
});

export const noteCreateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  trip_stop_id: z.number().int().positive().optional().nullable(),
});

export const noteUpdateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
