import api from './api';
import { WaterIntake } from '../types';

export interface CreateWaterIntakeData {
  date: string;
  amount: number;
  time?: string;
}

export interface UpdateWaterIntakeData extends Partial<CreateWaterIntakeData> {}

export interface GetWaterIntakesQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface WaterSummary {
  date: string;
  totalAmount: number;
  goal: number;
  remaining: number;
  percentage: number;
  count: number;
  intakes: WaterIntake[];
}

export const waterService = {
  async createWaterIntake(data: CreateWaterIntakeData): Promise<{ intake: WaterIntake }> {
    const response = await api.post('/water', data);
    return response.data;
  },

  async getWaterIntakes(query?: GetWaterIntakesQuery): Promise<{ intakes: WaterIntake[] }> {
    const response = await api.get('/water', { params: query });
    return response.data;
  },

  async getWaterIntake(id: string): Promise<{ intake: WaterIntake }> {
    const response = await api.get(`/water/${id}`);
    return response.data;
  },

  async updateWaterIntake(
    id: string,
    data: UpdateWaterIntakeData
  ): Promise<{ intake: WaterIntake }> {
    const response = await api.put(`/water/${id}`, data);
    return response.data;
  },

  async deleteWaterIntake(id: string): Promise<void> {
    await api.delete(`/water/${id}`);
  },

  async getDailySummary(date: string): Promise<{ summary: WaterSummary }> {
    const response = await api.get('/water/summary', { params: { date } });
    return response.data;
  },

  async quickAdd(amount: number, date?: string): Promise<{ intake: WaterIntake }> {
    const response = await api.post('/water/quick-add', { amount, date });
    return response.data;
  },
};
