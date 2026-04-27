import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import exerciseService from './exercise.service';
import {
  createExerciseSchema,
  updateExerciseSchema,
  getExercisesQuerySchema,
} from './exercise.validation';
import { z } from 'zod';

export class ExerciseController {
  async createExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createExerciseSchema.parse(req.body);
      const exercise = await exerciseService.createExercise(req.user.userId, validatedData);

      res.status(201).json({ exercise });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create exercise' });
      }
    }
  }

  async getExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = getExercisesQuerySchema.parse(req.query);
      const exercises = await exerciseService.getExercises(req.user.userId, query);

      res.status(200).json({ exercises });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to fetch exercises' });
      }
    }
  }

  async getExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const exercise = await exerciseService.getExerciseById(req.params.id, req.user.userId);

      res.status(200).json({ exercise });
    } catch (error) {
      if (error instanceof Error && error.message === 'Exercise not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch exercise' });
      }
    }
  }

  async updateExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateExerciseSchema.parse(req.body);
      const exercise = await exerciseService.updateExercise(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ exercise });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message === 'Exercise not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update exercise' });
      }
    }
  }

  async deleteExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await exerciseService.deleteExercise(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Exercise not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete exercise' });
      }
    }
  }

  async getDailySummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const date = req.query.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const summary = await exerciseService.getDailySummary(req.user.userId, date);

      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
  }

  async getWeeklySummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      const summary = await exerciseService.getWeeklySummary(
        req.user.userId,
        startDate,
        endDate
      );

      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weekly summary' });
    }
  }
}

export default new ExerciseController();
