import api from './api';
import { UserPreferences } from '../types';

export interface UpdatePreferencesData {
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbsGoal?: number;
  dailyFatsGoal?: number;
  dailyFiberGoal?: number;
  dailyWaterGoal?: number;
  targetWeight?: number;
  weightGoalType?: 'LOSE' | 'MAINTAIN' | 'GAIN';
  unitSystem?: 'METRIC' | 'IMPERIAL';
  timezone?: string;
}

export const preferencesService = {
  async getPreferences(): Promise<{ preferences: UserPreferences }> {
    const response = await api.get('/preferences');
    return response.data;
  },

  async updatePreferences(data: UpdatePreferencesData): Promise<{ preferences: UserPreferences }> {
    const response = await api.put('/preferences', data);
    return response.data;
  },
};
