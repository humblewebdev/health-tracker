import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import nutritionService from './nutrition.service';
import {
  createFoodEntrySchema,
  updateFoodEntrySchema,
  getFoodEntriesQuerySchema,
  createCustomFoodSchema,
  updateCustomFoodSchema,
} from './nutrition.validation';
import { z } from 'zod';

export class NutritionController {
  // Food Entries
  async createFoodEntry(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createFoodEntrySchema.parse(req.body);
      const entry = await nutritionService.createFoodEntry(req.user.userId, validatedData);

      res.status(201).json({ entry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create food entry' });
      }
    }
  }

  async getFoodEntries(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = getFoodEntriesQuerySchema.parse(req.query);
      const entries = await nutritionService.getFoodEntries(req.user.userId, query);

      res.status(200).json({ entries });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to fetch food entries' });
      }
    }
  }

  async getFoodEntry(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const entry = await nutritionService.getFoodEntryById(req.params.id, req.user.userId);

      res.status(200).json({ entry });
    } catch (error) {
      if (error instanceof Error && error.message === 'Food entry not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch food entry' });
      }
    }
  }

  async updateFoodEntry(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateFoodEntrySchema.parse(req.body);
      const entry = await nutritionService.updateFoodEntry(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ entry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message === 'Food entry not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update food entry' });
      }
    }
  }

  async deleteFoodEntry(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await nutritionService.deleteFoodEntry(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Food entry deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Food entry not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete food entry' });
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

      const summary = await nutritionService.getDailySummary(req.user.userId, date);

      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
  }

  // Custom Foods
  async createCustomFood(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createCustomFoodSchema.parse(req.body);
      const food = await nutritionService.createCustomFood(req.user.userId, validatedData);

      res.status(201).json({ food });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create custom food' });
      }
    }
  }

  async getCustomFoods(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const foods = await nutritionService.getCustomFoods(req.user.userId);

      res.status(200).json({ foods });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch custom foods' });
    }
  }

  async getCustomFood(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const food = await nutritionService.getCustomFoodById(req.params.id, req.user.userId);

      res.status(200).json({ food });
    } catch (error) {
      if (error instanceof Error && error.message === 'Custom food not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch custom food' });
      }
    }
  }

  async updateCustomFood(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateCustomFoodSchema.parse(req.body);
      const food = await nutritionService.updateCustomFood(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ food });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update custom food' });
      }
    }
  }

  async deleteCustomFood(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await nutritionService.deleteCustomFood(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Custom food deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete custom food' });
      }
    }
  }
}

export default new NutritionController();
