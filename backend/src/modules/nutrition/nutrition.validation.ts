import { z } from 'zod';

// Food Entry validation schemas
export const createFoodEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  foodName: z.string().min(1, 'Food name is required'),
  brand: z.string().optional(),
  servingSize: z.number().positive('Serving size must be positive'),
  servingUnit: z.string().min(1, 'Serving unit is required'),
  calories: z.number().int().nonnegative('Calories must be non-negative'),
  protein: z.number().nonnegative('Protein must be non-negative').default(0),
  carbs: z.number().nonnegative('Carbs must be non-negative').default(0),
  fats: z.number().nonnegative('Fats must be non-negative').default(0),
  fiber: z.number().nonnegative('Fiber must be non-negative').default(0),
  sugar: z.number().nonnegative('Sugar must be non-negative').default(0),
  sodium: z.number().nonnegative('Sodium must be non-negative').default(0),
  notes: z.string().optional(),
});

export const updateFoodEntrySchema = createFoodEntrySchema.partial();

export const getFoodEntriesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
});

// Custom Food validation schemas
export const createCustomFoodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  brand: z.string().optional(),
  servingSize: z.number().positive('Serving size must be positive'),
  servingUnit: z.string().min(1, 'Serving unit is required'),
  calories: z.number().int().nonnegative('Calories must be non-negative'),
  protein: z.number().nonnegative('Protein must be non-negative').default(0),
  carbs: z.number().nonnegative('Carbs must be non-negative').default(0),
  fats: z.number().nonnegative('Fats must be non-negative').default(0),
  fiber: z.number().nonnegative('Fiber must be non-negative').default(0),
  sugar: z.number().nonnegative('Sugar must be non-negative').default(0),
  sodium: z.number().nonnegative('Sodium must be non-negative').default(0),
  isPublic: z.boolean().default(false),
});

export const updateCustomFoodSchema = createCustomFoodSchema.partial();

export type CreateFoodEntryInput = z.infer<typeof createFoodEntrySchema>;
export type UpdateFoodEntryInput = z.infer<typeof updateFoodEntrySchema>;
export type GetFoodEntriesQuery = z.infer<typeof getFoodEntriesQuerySchema>;
export type CreateCustomFoodInput = z.infer<typeof createCustomFoodSchema>;
export type UpdateCustomFoodInput = z.infer<typeof updateCustomFoodSchema>;
