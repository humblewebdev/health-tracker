import prisma from '../../database/client';
import { Recipe, MealType } from '@prisma/client';

interface GenerateMealPlanParams {
  userId: string;
  startDate: string;
  endDate: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  dietaryPreferences: string[];
  excludedFoods: string[];
  mealsPerDay: number;
}

interface SelectedMeal {
  recipeId: string;
  mealType: MealType;
  servings: number;
}

class MealPlanGeneratorService {
  async generateMealPlan(params: GenerateMealPlanParams) {
    // 1. Get available recipes that match dietary preferences
    const availableRecipes = await this.getMatchingRecipes(
      params.userId,
      params.dietaryPreferences,
      params.excludedFoods
    );

    if (availableRecipes.length < params.mealsPerDay) {
      throw new Error(
        `Not enough recipes available matching your preferences. Found ${availableRecipes.length}, need at least ${params.mealsPerDay}.`
      );
    }

    // 2. Calculate days in plan
    const days = this.calculateDays(params.startDate, params.endDate);

    // 3. Generate meals for each day
    const allMeals: Array<SelectedMeal & { dayOfWeek: number }> = [];

    for (let day = 0; day < days; day++) {
      const dayMeals = await this.generateDayMeals(
        availableRecipes,
        params.targetCalories,
        params.targetProtein,
        params.targetCarbs,
        params.targetFats,
        params.mealsPerDay
      );

      allMeals.push(
        ...dayMeals.map((meal) => ({
          ...meal,
          dayOfWeek: day % 7,
        }))
      );
    }

    // 4. Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: params.userId,
        name: `Meal Plan ${params.startDate} to ${params.endDate}`,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        targetCalories: params.targetCalories,
        targetProtein: params.targetProtein,
        targetCarbs: params.targetCarbs,
        targetFats: params.targetFats,
        dietaryTags: params.dietaryPreferences,
        excludedFoods: params.excludedFoods,
        meals: {
          create: allMeals,
        },
      },
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

    return mealPlan;
  }

  private async generateDayMeals(
    recipes: Recipe[],
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFats: number,
    mealsPerDay: number
  ): Promise<SelectedMeal[]> {
    const meals: SelectedMeal[] = [];

    // Organize recipes by category
    const breakfastRecipes = recipes.filter((r) => r.category === 'BREAKFAST');
    const lunchRecipes = recipes.filter((r) => r.category === 'LUNCH');
    const dinnerRecipes = recipes.filter((r) => r.category === 'DINNER');
    const snackRecipes = recipes.filter((r) => r.category === 'SNACK');
    const smoothieRecipes = recipes.filter((r) => r.category === 'SMOOTHIE');

    // Meal distribution strategy
    // Breakfast: 25% of calories
    if (breakfastRecipes.length > 0 || smoothieRecipes.length > 0) {
      const targetCals = targetCalories * 0.25;
      const breakfast = this.selectMeal(
        [...breakfastRecipes, ...smoothieRecipes],
        targetCals,
        targetProtein / mealsPerDay,
        targetCarbs / mealsPerDay,
        targetFats / mealsPerDay
      );
      if (breakfast) {
        meals.push({
          recipeId: breakfast.recipe.id,
          mealType: 'BREAKFAST',
          servings: breakfast.servings,
        });
      }
    }

    // Lunch: 35% of calories
    if (lunchRecipes.length > 0) {
      const targetCals = targetCalories * 0.35;
      const lunch = this.selectMeal(
        lunchRecipes,
        targetCals,
        targetProtein / mealsPerDay,
        targetCarbs / mealsPerDay,
        targetFats / mealsPerDay
      );
      if (lunch) {
        meals.push({
          recipeId: lunch.recipe.id,
          mealType: 'LUNCH',
          servings: lunch.servings,
        });
      }
    }

    // Dinner: 30% of calories
    if (dinnerRecipes.length > 0) {
      const targetCals = targetCalories * 0.3;
      const dinner = this.selectMeal(
        dinnerRecipes,
        targetCals,
        targetProtein / mealsPerDay,
        targetCarbs / mealsPerDay,
        targetFats / mealsPerDay
      );
      if (dinner) {
        meals.push({
          recipeId: dinner.recipe.id,
          mealType: 'DINNER',
          servings: dinner.servings,
        });
      }
    }

    // Snacks: 10% of calories (if meals per day >= 4)
    if (mealsPerDay >= 4 && snackRecipes.length > 0) {
      const targetCals = targetCalories * 0.1;
      const snack = this.selectMeal(
        snackRecipes,
        targetCals,
        targetProtein / mealsPerDay,
        targetCarbs / mealsPerDay,
        targetFats / mealsPerDay
      );
      if (snack) {
        meals.push({
          recipeId: snack.recipe.id,
          mealType: 'SNACK',
          servings: snack.servings,
        });
      }
    }

    return meals;
  }

  private selectMeal(
    recipes: Recipe[],
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFats: number
  ): { recipe: Recipe; servings: number } | null {
    if (recipes.length === 0) return null;

    // Score each recipe based on how well it matches targets
    const scoredRecipes = recipes.map((recipe) => {
      // Calculate how close the recipe is to targets
      const calorieScore = 1 - Math.min(Math.abs(recipe.calories - targetCalories) / targetCalories, 1);
      const proteinScore = 1 - Math.min(Math.abs(recipe.protein - targetProtein) / Math.max(targetProtein, 1), 1);
      const carbsScore = 1 - Math.min(Math.abs(recipe.carbs - targetCarbs) / Math.max(targetCarbs, 1), 1);
      const fatsScore = 1 - Math.min(Math.abs(recipe.fats - targetFats) / Math.max(targetFats, 1), 1);

      // Weighted average (calories weighted more heavily)
      const totalScore = calorieScore * 0.4 + proteinScore * 0.2 + carbsScore * 0.2 + fatsScore * 0.2;

      return { recipe, score: totalScore };
    });

    // Sort by score descending
    scoredRecipes.sort((a, b) => b.score - a.score);

    // Pick from top 5 randomly for variety
    const topRecipes = scoredRecipes.slice(0, Math.min(5, scoredRecipes.length));
    const selected = topRecipes[Math.floor(Math.random() * topRecipes.length)];

    // Calculate servings needed to match target calories
    const servings = Math.max(0.5, Math.min(3, targetCalories / selected.recipe.calories));
    const roundedServings = Math.round(servings * 2) / 2; // Round to nearest 0.5

    return { recipe: selected.recipe, servings: roundedServings };
  }

  private async getMatchingRecipes(
    userId: string,
    dietaryPreferences: string[],
    excludedFoods: string[]
  ): Promise<Recipe[]> {
    const where: any = {
      OR: [{ userId }, { isPublic: true }, { userId: null }],
    };

    // Apply dietary filters (AND logic - recipe must meet ALL selected preferences)
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
    if (excludedFoods.length > 0) {
      where.ingredients = {
        none: {
          name: {
            in: excludedFoods.map((f) => f.toLowerCase().trim()),
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

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  }
}

export default new MealPlanGeneratorService();
