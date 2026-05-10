import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  profile_photo_url: z.string().url().optional().nullable(),
  language_preference: z.string().optional(),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
});

export const savedDestinationSchema = z.object({
  city_id: z.number().int().positive(),
});
