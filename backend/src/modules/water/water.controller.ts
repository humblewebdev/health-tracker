import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import waterService from './water.service';
import {
  createWaterIntakeSchema,
  updateWaterIntakeSchema,
  getWaterIntakesQuerySchema,
} from './water.validation';
import { z } from 'zod';

export class WaterController {
  async createWaterIntake(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createWaterIntakeSchema.parse(req.body);
      const intake = await waterService.createWaterIntake(req.user.userId, validatedData);

      res.status(201).json({ intake });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create water intake' });
      }
    }
  }

  async getWaterIntakes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = getWaterIntakesQuerySchema.parse(req.query);
      const intakes = await waterService.getWaterIntakes(req.user.userId, query);

      res.status(200).json({ intakes });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to fetch water intakes' });
      }
    }
  }

  async getWaterIntake(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const intake = await waterService.getWaterIntakeById(req.params.id, req.user.userId);

      res.status(200).json({ intake });
    } catch (error) {
      if (error instanceof Error && error.message === 'Water intake not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch water intake' });
      }
    }
  }

  async updateWaterIntake(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateWaterIntakeSchema.parse(req.body);
      const intake = await waterService.updateWaterIntake(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ intake });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message === 'Water intake not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update water intake' });
      }
    }
  }

  async deleteWaterIntake(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await waterService.deleteWaterIntake(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Water intake deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Water intake not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete water intake' });
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

      const summary = await waterService.getDailySummary(req.user.userId, date);

      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
  }

  async quickAdd(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const amount = parseInt(req.body.amount);
      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }

      const date = req.body.date as string | undefined;
      const intake = await waterService.quickAdd(req.user.userId, amount, date);

      res.status(201).json({ intake });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add water intake' });
    }
  }
}

export default new WaterController();
