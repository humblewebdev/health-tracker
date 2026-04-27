import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  // Nutrition goals
  dailyCalorieGoal: z.number().int().positive().optional(),
  dailyProteinGoal: z.number().int().positive().optional(),
  dailyCarbsGoal: z.number().int().positive().optional(),
  dailyFatsGoal: z.number().int().positive().optional(),
  dailyFiberGoal: z.number().int().positive().optional(),

  // Water goal
  dailyWaterGoal: z.number().int().positive().optional(),

  // Weight goals
  targetWeight: z.number().positive().optional(),
  weightGoalType: z.enum(['LOSE', 'MAINTAIN', 'GAIN']).optional(),

  // System preferences
  unitSystem: z.enum(['METRIC', 'IMPERIAL']).optional(),
  timezone: z.string().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
