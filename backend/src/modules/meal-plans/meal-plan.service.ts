import prisma from '../../database/client';
import { MealPlan } from '@prisma/client';

type MealPlanWithMeals = MealPlan & { meals: any[] };

class MealPlanService {
  async getMealPlans(userId: string): Promise<MealPlanWithMeals[]> {
    return prisma.mealPlan.findMany({
      where: { userId },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMealPlan(id: string, userId: string): Promise<MealPlanWithMeals> {
    const plan = await prisma.mealPlan.findFirst({
      where: { id, userId },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    return plan;
  }

  async getActiveMealPlan(userId: string): Promise<MealPlanWithMeals | null> {
    return prisma.mealPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });
  }

  async activateMealPlan(id: string, userId: string): Promise<MealPlan> {
    // Verify ownership
    const plan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    // Deactivate all other plans
    await prisma.mealPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Activate this plan
    return prisma.mealPlan.update({
      where: { id },
      data: { isActive: true },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
    });
  }

  async applyMealPlanToDay(
    mealPlanId: string,
    userId: string,
    date: string,
    dayOfWeek: number
  ): Promise<void> {
    const plan = await this.getMealPlan(mealPlanId, userId);

    // Get meals for the specified day
    const dayMeals = plan.meals.filter((m) => m.dayOfWeek === dayOfWeek);

    if (dayMeals.length === 0) {
      throw new Error(`No meals found for day ${dayOfWeek} in this meal plan`);
    }

    // Create food entries for each meal
    for (const meal of dayMeals) {
      await prisma.foodEntry.create({
        data: {
          userId,
          date: new Date(date),
          mealType: meal.mealType,
          foodName: meal.recipe.name,
          servingSize: meal.servings,
          servingUnit: 'serving',
          calories: Math.round(meal.recipe.calories * meal.servings),
          protein: meal.recipe.protein * meal.servings,
          carbs: meal.recipe.carbs * meal.servings,
          fats: meal.recipe.fats * meal.servings,
          fiber: (meal.recipe.fiber || 0) * meal.servings,
          sugar: (meal.recipe.sugar || 0) * meal.servings,
        },
      });
    }
  }

  async updateMealPlanName(
    id: string,
    userId: string,
    name: string,
    description?: string
  ): Promise<MealPlan> {
    // Verify ownership
    const plan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    return prisma.mealPlan.update({
      where: { id },
      data: { name, description },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
    });
  }

  async swapMeal(
    mealPlanId: string,
    mealId: string,
    newRecipeId: string,
    userId: string
  ): Promise<any> {
    // Verify ownership
    const plan = await this.getMealPlan(mealPlanId, userId);

    // Find the meal to swap
    const mealToSwap = plan.meals.find((m) => m.id === mealId);
    if (!mealToSwap) {
      throw new Error('Meal not found in this plan');
    }

    // Get the new recipe
    const newRecipe = await prisma.recipe.findUnique({
      where: { id: newRecipeId },
    });

    if (!newRecipe) {
      throw new Error('New recipe not found');
    }

    // Update the meal with the new recipe
    return prisma.mealPlanRecipe.update({
      where: { id: mealId },
      data: { recipeId: newRecipeId },
      include: {
        recipe: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }

  async deleteMealPlan(id: string, userId: string): Promise<void> {
    // Verify ownership
    const plan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    await prisma.mealPlan.delete({
      where: { id },
    });
  }

  async getShoppingList(mealPlanId: string, userId: string): Promise<any> {
    const plan = await this.getMealPlan(mealPlanId, userId);

    // Aggregate all ingredients
    const ingredientMap = new Map<string, { amount: number; unit: string; recipes: string[] }>();

    for (const meal of plan.meals) {
      for (const ingredient of meal.recipe.ingredients) {
        const key = `${ingredient.name}-${ingredient.unit}`;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.amount += ingredient.amount * meal.servings;
          if (!existing.recipes.includes(meal.recipe.name)) {
            existing.recipes.push(meal.recipe.name);
          }
        } else {
          ingredientMap.set(key, {
            amount: ingredient.amount * meal.servings,
            unit: ingredient.unit,
            recipes: [meal.recipe.name],
          });
        }
      }
    }

    // Convert map to array
    const shoppingList = Array.from(ingredientMap.entries()).map(([key, value]) => {
      const name = key.split('-')[0];
      return {
        name,
        amount: Math.round(value.amount * 10) / 10, // Round to 1 decimal
        unit: value.unit,
        usedIn: value.recipes,
      };
    });

    // Sort alphabetically
    shoppingList.sort((a, b) => a.name.localeCompare(b.name));

    return {
      mealPlanId: plan.id,
      mealPlanName: plan.name,
      ingredients: shoppingList,
      totalItems: shoppingList.length,
    };
  }
}

export default new MealPlanService();
