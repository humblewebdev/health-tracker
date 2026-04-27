import prisma from '../../database/client';
import { Recipe, RecipeCategory, Difficulty } from '@prisma/client';

export interface CreateRecipeData {
  name: string;
  description?: string;
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty?: Difficulty;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isKeto?: boolean;
  isPaleo?: boolean;
  isPublic?: boolean;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {}

export interface RecipeFilters {
  category?: RecipeCategory;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isKeto?: boolean;
  isPaleo?: boolean;
  difficulty?: Difficulty;
  maxPrepTime?: number;
  maxCalories?: number;
}

class RecipeService {
  async createRecipe(userId: string | null, data: CreateRecipeData): Promise<Recipe> {
    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty || 'MEDIUM',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        fiber: data.fiber,
        sugar: data.sugar,
        instructions: data.instructions,
        imageUrl: data.imageUrl,
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        isGlutenFree: data.isGlutenFree || false,
        isDairyFree: data.isDairyFree || false,
        isKeto: data.isKeto || false,
        isPaleo: data.isPaleo || false,
        userId: userId,
        isPublic: data.isPublic || false,
        ingredients: {
          create: data.ingredients,
        },
      },
      include: {
        ingredients: true,
      },
    });

    return recipe;
  }

  async getRecipes(userId: string | null, filters?: RecipeFilters): Promise<Recipe[]> {
    const where: any = {
      OR: [
        { userId: userId },
        { isPublic: true },
        { userId: null },
      ],
    };

    if (filters) {
      if (filters.category) where.category = filters.category;
      if (filters.isVegetarian !== undefined) where.isVegetarian = filters.isVegetarian;
      if (filters.isVegan !== undefined) where.isVegan = filters.isVegan;
      if (filters.isGlutenFree !== undefined) where.isGlutenFree = filters.isGlutenFree;
      if (filters.isDairyFree !== undefined) where.isDairyFree = filters.isDairyFree;
      if (filters.isKeto !== undefined) where.isKeto = filters.isKeto;
      if (filters.isPaleo !== undefined) where.isPaleo = filters.isPaleo;
      if (filters.difficulty) where.difficulty = filters.difficulty;
      if (filters.maxPrepTime) {
        where.prepTime = { lte: filters.maxPrepTime };
      }
      if (filters.maxCalories) {
        where.calories = { lte: filters.maxCalories };
      }
    }

    return prisma.recipe.findMany({
      where,
      include: {
        ingredients: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
      },
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    return recipe;
  }

  async searchRecipes(userId: string | null, query: string): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      where: {
        OR: [
          { userId: userId },
          { isPublic: true },
          { userId: null },
        ],
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              {
                ingredients: {
                  some: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        ingredients: true,
      },
      take: 50,
    });
  }

  async updateRecipe(
    id: string,
    userId: string,
    data: UpdateRecipeData
  ): Promise<Recipe> {
    // Verify ownership
    const recipe = await prisma.recipe.findFirst({
      where: { id, userId },
    });

    if (!recipe) {
      throw new Error('Recipe not found or unauthorized');
    }

    // If updating ingredients, delete old ones and create new
    if (data.ingredients) {
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });
    }

    const updateData: any = {
      name: data.name,
      description: data.description,
      category: data.category,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      difficulty: data.difficulty,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
      fiber: data.fiber,
      sugar: data.sugar,
      instructions: data.instructions,
      imageUrl: data.imageUrl,
      isVegetarian: data.isVegetarian,
      isVegan: data.isVegan,
      isGlutenFree: data.isGlutenFree,
      isDairyFree: data.isDairyFree,
      isKeto: data.isKeto,
      isPaleo: data.isPaleo,
      isPublic: data.isPublic,
    };

    if (data.ingredients) {
      updateData.ingredients = {
        create: data.ingredients,
      };
    }

    return prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        ingredients: true,
      },
    });
  }

  async deleteRecipe(id: string, userId: string): Promise<void> {
    // Verify ownership
    const recipe = await prisma.recipe.findFirst({
      where: { id, userId },
    });

    if (!recipe) {
      throw new Error('Recipe not found or unauthorized');
    }

    await prisma.recipe.delete({
      where: { id },
    });
  }

  async getRecipesByCategory(
    userId: string | null,
    category: RecipeCategory
  ): Promise<Recipe[]> {
    return this.getRecipes(userId, { category });
  }

  async getRecipesMatchingDiet(
    userId: string | null,
    dietaryPreferences: string[],
    excludedIngredients: string[]
  ): Promise<Recipe[]> {
    const where: any = {
      OR: [
        { userId: userId },
        { isPublic: true },
        { userId: null },
      ],
    };

    // Apply dietary filters
    if (dietaryPreferences.includes('vegetarian')) {
      where.isVegetarian = true;
    }
    if (dietaryPreferences.includes('vegan')) {
      where.isVegan = true;
    }
    if (dietaryPreferences.includes('gluten-free')) {
      where.isGlutenFree = true;
    }
    if (dietaryPreferences.includes('dairy-free')) {
      where.isDairyFree = true;
    }
    if (dietaryPreferences.includes('keto')) {
      where.isKeto = true;
    }
    if (dietaryPreferences.includes('paleo')) {
      where.isPaleo = true;
    }

    // Exclude recipes with excluded ingredients
    if (excludedIngredients.length > 0) {
      where.ingredients = {
        none: {
          name: {
            in: excludedIngredients.map(i => i.toLowerCase()),
            mode: 'insensitive',
          },
        },
      };
    }

    return prisma.recipe.findMany({
      where,
      include: {
        ingredients: true,
      },
    });
  }
}

export default new RecipeService();
