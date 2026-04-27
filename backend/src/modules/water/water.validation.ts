import { z } from 'zod';

export const createWaterIntakeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount: z.number().int().positive('Amount must be positive'),
  time: z.string().optional(), // Optional ISO timestamp
});

export const updateWaterIntakeSchema = createWaterIntakeSchema.partial();

export const getWaterIntakesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateWaterIntakeInput = z.infer<typeof createWaterIntakeSchema>;
export type UpdateWaterIntakeInput = z.infer<typeof updateWaterIntakeSchema>;
export type GetWaterIntakesQuery = z.infer<typeof getWaterIntakesQuerySchema>;
