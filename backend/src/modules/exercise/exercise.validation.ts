import { z } from 'zod';

export const createExerciseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  exerciseType: z.enum(['CARDIO', 'STRENGTH', 'SPORTS', 'FLEXIBILITY', 'OTHER']),
  name: z.string().min(1, 'Exercise name is required'),

  // Common fields
  duration: z.number().int().positive('Duration must be positive').optional(),
  caloriesBurned: z.number().int().nonnegative('Calories must be non-negative').optional(),
  intensity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional(),

  // Cardio specific
  distance: z.number().positive('Distance must be positive').optional(),
  averageHeartRate: z.number().int().positive('Heart rate must be positive').optional(),

  // Strength specific
  sets: z.number().int().positive('Sets must be positive').optional(),
  reps: z.number().int().positive('Reps must be positive').optional(),
  weight: z.number().positive('Weight must be positive').optional(),

  notes: z.string().optional(),
  time: z.string().optional(), // Optional ISO timestamp
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const getExercisesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  exerciseType: z.enum(['CARDIO', 'STRENGTH', 'SPORTS', 'FLEXIBILITY', 'OTHER']).optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type GetExercisesQuery = z.infer<typeof getExercisesQuerySchema>;
