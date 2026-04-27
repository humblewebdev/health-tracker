import { z } from 'zod';

export const createMeasurementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  measurementType: z.enum(['WEIGHT', 'BODY_COMPOSITION', 'BODY_MEASUREMENTS']),

  // Weight measurements
  weight: z.number().positive('Weight must be positive').optional(),
  bmi: z.number().positive().optional(),

  // Body composition
  bodyFatPercent: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  boneMass: z.number().positive().optional(),
  waterPercent: z.number().min(0).max(100).optional(),

  // Body measurements (in cm)
  neck: z.number().positive().optional(),
  shoulders: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  leftThigh: z.number().positive().optional(),
  rightThigh: z.number().positive().optional(),
  leftArm: z.number().positive().optional(),
  rightArm: z.number().positive().optional(),
  leftCalf: z.number().positive().optional(),
  rightCalf: z.number().positive().optional(),

  notes: z.string().optional(),
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

export const getMeasurementsQuerySchema = z.object({
  measurementType: z.enum(['WEIGHT', 'BODY_COMPOSITION', 'BODY_MEASUREMENTS']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
export type GetMeasurementsQuery = z.infer<typeof getMeasurementsQuerySchema>;
