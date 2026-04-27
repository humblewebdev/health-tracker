import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import recipeService from './recipe.service';
import {
  createRecipeSchema,
  updateRecipeSchema,
  recipeFiltersSchema,
} from './recipe.validation';
import { z } from 'zod';

export class RecipeController {
  async createRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createRecipeSchema.parse(req.body);
      const recipe = await recipeService.createRecipe(req.user.userId, validatedData);

      res.status(201).json({ recipe });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        console.error('Create recipe error:', error);
        res.status(500).json({ error: 'Failed to create recipe' });
      }
    }
  }

  async getRecipes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters = recipeFiltersSchema.parse(req.query);
      const recipes = await recipeService.getRecipes(req.user.userId, filters);

      res.status(200).json({ recipes });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        console.error('Get recipes error:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
      }
    }
  }

  async getRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const recipe = await recipeService.getRecipeById(req.params.id);

      res.status(200).json({ recipe });
    } catch (error) {
      if (error instanceof Error && error.message === 'Recipe not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Get recipe error:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
      }
    }
  }

  async searchRecipes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const recipes = await recipeService.searchRecipes(req.user.userId, query);

      res.status(200).json({ recipes });
    } catch (error) {
      console.error('Search recipes error:', error);
      res.status(500).json({ error: 'Failed to search recipes' });
    }
  }

  async updateRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateRecipeSchema.parse(req.body);
      const recipe = await recipeService.updateRecipe(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ recipe });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Update recipe error:', error);
        res.status(500).json({ error: 'Failed to update recipe' });
      }
    }
  }

  async deleteRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await recipeService.deleteRecipe(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Delete recipe error:', error);
        res.status(500).json({ error: 'Failed to delete recipe' });
      }
    }
  }
}

export default new RecipeController();
