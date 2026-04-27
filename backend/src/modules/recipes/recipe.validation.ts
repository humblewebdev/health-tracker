import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
});

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SMOOTHIE', 'SALAD']),
  prepTime: z.number().int().min(0, 'Prep time must be non-negative'),
  cookTime: z.number().int().min(0, 'Cook time must be non-negative'),
  servings: z.number().int().min(1, 'Servings must be at least 1'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  calories: z.number().int().min(0, 'Calories must be non-negative'),
  protein: z.number().min(0, 'Protein must be non-negative'),
  carbs: z.number().min(0, 'Carbs must be non-negative'),
  fats: z.number().min(0, 'Fats must be non-negative'),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  imageUrl: z.string().url().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isDairyFree: z.boolean().optional(),
  isKeto: z.boolean().optional(),
  isPaleo: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const recipeFiltersSchema = z.object({
  category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SMOOTHIE', 'SALAD']).optional(),
  isVegetarian: z.string().transform(val => val === 'true').optional(),
  isVegan: z.string().transform(val => val === 'true').optional(),
  isGlutenFree: z.string().transform(val => val === 'true').optional(),
  isDairyFree: z.string().transform(val => val === 'true').optional(),
  isKeto: z.string().transform(val => val === 'true').optional(),
  isPaleo: z.string().transform(val => val === 'true').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  maxPrepTime: z.string().transform(val => parseInt(val)).optional(),
  maxCalories: z.string().transform(val => parseInt(val)).optional(),
});
