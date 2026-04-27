import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import mealPlanGeneratorService from './meal-plan-generator.service';
import mealPlanService from './meal-plan.service';
import {
  generateMealPlanSchema,
  applyMealPlanSchema,
  updateMealPlanSchema,
  swapMealSchema,
} from './meal-plan.validation';
import { z } from 'zod';
import prisma from '../../database/client';

export class MealPlanController {
  async generateMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = generateMealPlanSchema.parse(req.body);

      // Get user preferences for nutrition goals
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.user.userId },
      });

      let targetCalories: number;
      let targetProtein: number;
      let targetCarbs: number;
      let targetFats: number;

      if (validatedData.useUserGoals && preferences) {
        targetCalories = preferences.dailyCalorieGoal;
        targetProtein = preferences.dailyProteinGoal;
        targetCarbs = preferences.dailyCarbsGoal;
        targetFats = preferences.dailyFatsGoal;
      } else if (validatedData.customTargets) {
        targetCalories = validatedData.customTargets.calories;
        targetProtein = validatedData.customTargets.protein;
        targetCarbs = validatedData.customTargets.carbs;
        targetFats = validatedData.customTargets.fats;
      } else {
        // Default goals
        targetCalories = 2000;
        targetProtein = 150;
        targetCarbs = 200;
        targetFats = 65;
      }

      const mealPlan = await mealPlanGeneratorService.generateMealPlan({
        userId: req.user.userId,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFats,
        dietaryPreferences: validatedData.dietaryPreferences,
        excludedFoods: validatedData.excludedFoods,
        mealsPerDay: validatedData.mealsPerDay,
      });

      res.status(201).json({ mealPlan });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error) {
        console.error('Generate meal plan error:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to generate meal plan' });
      }
    }
  }

  async getMealPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealPlans = await mealPlanService.getMealPlans(req.user.userId);

      res.status(200).json({ mealPlans });
    } catch (error) {
      console.error('Get meal plans error:', error);
      res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
  }

  async getMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealPlan = await mealPlanService.getMealPlan(req.params.id, req.user.userId);

      res.status(200).json({ mealPlan });
    } catch (error) {
      if (error instanceof Error && error.message === 'Meal plan not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Get meal plan error:', error);
        res.status(500).json({ error: 'Failed to fetch meal plan' });
      }
    }
  }

  async getActiveMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealPlan = await mealPlanService.getActiveMealPlan(req.user.userId);

      if (!mealPlan) {
        res.status(404).json({ error: 'No active meal plan found' });
        return;
      }

      res.status(200).json({ mealPlan });
    } catch (error) {
      console.error('Get active meal plan error:', error);
      res.status(500).json({ error: 'Failed to fetch active meal plan' });
    }
  }

  async activateMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealPlan = await mealPlanService.activateMealPlan(req.params.id, req.user.userId);

      res.status(200).json({ mealPlan, message: 'Meal plan activated successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Meal plan not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Activate meal plan error:', error);
        res.status(500).json({ error: 'Failed to activate meal plan' });
      }
    }
  }

  async applyMealPlanToDay(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = applyMealPlanSchema.parse(req.body);

      await mealPlanService.applyMealPlanToDay(
        req.params.id,
        req.user.userId,
        validatedData.date,
        validatedData.dayOfWeek
      );

      res.status(200).json({ message: 'Meals added to food log successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error) {
        console.error('Apply meal plan error:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to apply meal plan' });
      }
    }
  }

  async updateMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateMealPlanSchema.parse(req.body);

      const mealPlan = await mealPlanService.updateMealPlanName(
        req.params.id,
        req.user.userId,
        validatedData.name!,
        validatedData.description
      );

      res.status(200).json({ mealPlan });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message === 'Meal plan not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Update meal plan error:', error);
        res.status(500).json({ error: 'Failed to update meal plan' });
      }
    }
  }

  async swapMeal(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = swapMealSchema.parse(req.body);

      const updatedMeal = await mealPlanService.swapMeal(
        req.params.id,
        req.params.mealId,
        validatedData.newRecipeId,
        req.user.userId
      );

      res.status(200).json({ meal: updatedMeal, message: 'Meal swapped successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error) {
        console.error('Swap meal error:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to swap meal' });
      }
    }
  }

  async deleteMealPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await mealPlanService.deleteMealPlan(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Meal plan not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Delete meal plan error:', error);
        res.status(500).json({ error: 'Failed to delete meal plan' });
      }
    }
  }

  async getShoppingList(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const shoppingList = await mealPlanService.getShoppingList(
        req.params.id,
        req.user.userId
      );

      res.status(200).json(shoppingList);
    } catch (error) {
      if (error instanceof Error && error.message === 'Meal plan not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Get shopping list error:', error);
        res.status(500).json({ error: 'Failed to generate shopping list' });
      }
    }
  }
}

export default new MealPlanController();
