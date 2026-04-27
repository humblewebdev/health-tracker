import api from './api';

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  dietaryTags: string[];
  excludedFoods: string[];
  isActive: boolean;
  meals: MealPlanMeal[];
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanMeal {
  id: string;
  recipeId: string;
  recipe: Recipe;
  dayOfWeek: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  servings: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isKeto: boolean;
  isPaleo: boolean;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface GenerateMealPlanData {
  startDate: string;
  endDate: string;
  mealsPerDay: number;
  dietaryPreferences: string[];
  excludedFoods: string[];
  useUserGoals?: boolean;
  customTargets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface ShoppingList {
  mealPlanId: string;
  mealPlanName: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    usedIn: string[];
  }>;
  totalItems: number;
}

export const mealPlanService = {
  async generateMealPlan(data: GenerateMealPlanData): Promise<{ mealPlan: MealPlan }> {
    const response = await api.post('/meal-plans/generate', data);
    return response.data;
  },

  async getMealPlans(): Promise<{ mealPlans: MealPlan[] }> {
    const response = await api.get('/meal-plans');
    return response.data;
  },

  async getMealPlan(id: string): Promise<{ mealPlan: MealPlan }> {
    const response = await api.get(`/meal-plans/${id}`);
    return response.data;
  },

  async getActiveMealPlan(): Promise<{ mealPlan: MealPlan }> {
    const response = await api.get('/meal-plans/active');
    return response.data;
  },

  async activateMealPlan(id: string): Promise<{ mealPlan: MealPlan }> {
    const response = await api.post(`/meal-plans/${id}/activate`);
    return response.data;
  },

  async applyMealPlanToDay(id: string, date: string, dayOfWeek: number): Promise<void> {
    await api.post(`/meal-plans/${id}/apply`, { date, dayOfWeek });
  },

  async updateMealPlan(
    id: string,
    data: { name?: string; description?: string }
  ): Promise<{ mealPlan: MealPlan }> {
    const response = await api.put(`/meal-plans/${id}`, data);
    return response.data;
  },

  async swapMeal(mealPlanId: string, mealId: string, newRecipeId: string): Promise<any> {
    const response = await api.post(`/meal-plans/${mealPlanId}/meals/${mealId}/swap`, {
      newRecipeId,
    });
    return response.data;
  },

  async deleteMealPlan(id: string): Promise<void> {
    await api.delete(`/meal-plans/${id}`);
  },

  async getShoppingList(id: string): Promise<ShoppingList> {
    const response = await api.get(`/meal-plans/${id}/shopping-list`);
    return response.data;
  },
};

export const recipeService = {
  async getRecipes(filters?: {
    category?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
  }): Promise<{ recipes: Recipe[] }> {
    const response = await api.get('/recipes', { params: filters });
    return response.data;
  },

  async getRecipe(id: string): Promise<{ recipe: Recipe }> {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  async searchRecipes(query: string): Promise<{ recipes: Recipe[] }> {
    const response = await api.get('/recipes/search', { params: { q: query } });
    return response.data;
  },

  async createRecipe(data: Partial<Recipe>): Promise<{ recipe: Recipe }> {
    const response = await api.post('/recipes', data);
    return response.data;
  },

  async updateRecipe(id: string, data: Partial<Recipe>): Promise<{ recipe: Recipe }> {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  async deleteRecipe(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`);
  },
};
