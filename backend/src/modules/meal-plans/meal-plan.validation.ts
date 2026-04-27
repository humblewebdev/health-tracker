import { z } from 'zod';

export const generateMealPlanSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  mealsPerDay: z.number().int().min(2).max(6),
  dietaryPreferences: z.array(z.string()).default([]),
  excludedFoods: z.array(z.string()).default([]),
  useUserGoals: z.boolean().default(true).optional(),
  customTargets: z
    .object({
      calories: z.number().int().min(800).max(5000),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fats: z.number().min(0),
    })
    .optional(),
});

export const applyMealPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  dayOfWeek: z.number().int().min(0).max(6),
});

export const updateMealPlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const swapMealSchema = z.object({
  newRecipeId: z.string().uuid('Invalid recipe ID'),
});
