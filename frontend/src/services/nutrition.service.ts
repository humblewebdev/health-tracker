import api from './api';
import { FoodEntry, CustomFood } from '../types';

export interface CreateFoodEntryData {
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  notes?: string;
}

export interface UpdateFoodEntryData extends Partial<CreateFoodEntryData> {}

export interface GetFoodEntriesQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealBreakdown: {
    BREAKFAST: { count: number; calories: number };
    LUNCH: { count: number; calories: number };
    DINNER: { count: number; calories: number };
    SNACK: { count: number; calories: number };
  };
  entries: FoodEntry[];
}

export interface CreateCustomFoodData {
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isPublic?: boolean;
}

export const nutritionService = {
  // Food Entries
  async createFoodEntry(data: CreateFoodEntryData): Promise<{ entry: FoodEntry }> {
    const response = await api.post('/nutrition/entries', data);
    return response.data;
  },

  async getFoodEntries(query?: GetFoodEntriesQuery): Promise<{ entries: FoodEntry[] }> {
    const response = await api.get('/nutrition/entries', { params: query });
    return response.data;
  },

  async getFoodEntry(id: string): Promise<{ entry: FoodEntry }> {
    const response = await api.get(`/nutrition/entries/${id}`);
    return response.data;
  },

  async updateFoodEntry(id: string, data: UpdateFoodEntryData): Promise<{ entry: FoodEntry }> {
    const response = await api.put(`/nutrition/entries/${id}`, data);
    return response.data;
  },

  async deleteFoodEntry(id: string): Promise<void> {
    await api.delete(`/nutrition/entries/${id}`);
  },

  async getDailySummary(date: string): Promise<{ summary: DailySummary }> {
    const response = await api.get('/nutrition/summary', { params: { date } });
    return response.data;
  },

  // Custom Foods
  async createCustomFood(data: CreateCustomFoodData): Promise<{ food: CustomFood }> {
    const response = await api.post('/nutrition/foods/custom', data);
    return response.data;
  },

  async getCustomFoods(): Promise<{ foods: CustomFood[] }> {
    const response = await api.get('/nutrition/foods/custom');
    return response.data;
  },

  async getCustomFood(id: string): Promise<{ food: CustomFood }> {
    const response = await api.get(`/nutrition/foods/custom/${id}`);
    return response.data;
  },

  async updateCustomFood(id: string, data: Partial<CreateCustomFoodData>): Promise<{ food: CustomFood }> {
    const response = await api.put(`/nutrition/foods/custom/${id}`, data);
    return response.data;
  },

  async deleteCustomFood(id: string): Promise<void> {
    await api.delete(`/nutrition/foods/custom/${id}`);
  },
};
