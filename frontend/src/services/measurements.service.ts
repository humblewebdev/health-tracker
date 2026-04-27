import api from './api';
import { Measurement, MeasurementType } from '../types';

export interface CreateMeasurementData {
  date: string;
  measurementType: MeasurementType;
  weight?: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercent?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftArm?: number;
  rightArm?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

export interface UpdateMeasurementData extends Partial<CreateMeasurementData> {}

export interface GetMeasurementsQuery {
  measurementType?: MeasurementType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface WeightStats {
  current: number | null;
  average: number | null;
  min: number | null;
  max: number | null;
  change: number | null;
}

export interface WeightTrendsResponse {
  measurements: Array<{
    date: string;
    weight: number;
    bmi: number | null;
  }>;
  stats: WeightStats;
}

export const measurementsService = {
  async createMeasurement(data: CreateMeasurementData): Promise<{ measurement: Measurement }> {
    const response = await api.post('/measurements', data);
    return response.data;
  },

  async getMeasurements(query?: GetMeasurementsQuery): Promise<{ measurements: Measurement[] }> {
    const response = await api.get('/measurements', { params: query });
    return response.data;
  },

  async getMeasurement(id: string): Promise<{ measurement: Measurement }> {
    const response = await api.get(`/measurements/${id}`);
    return response.data;
  },

  async updateMeasurement(
    id: string,
    data: UpdateMeasurementData
  ): Promise<{ measurement: Measurement }> {
    const response = await api.put(`/measurements/${id}`, data);
    return response.data;
  },

  async deleteMeasurement(id: string): Promise<void> {
    await api.delete(`/measurements/${id}`);
  },

  async getLatest(type?: MeasurementType): Promise<{ measurement: Measurement }> {
    const response = await api.get('/measurements/latest', { params: { type } });
    return response.data;
  },

  async getWeightTrends(days: number = 30): Promise<WeightTrendsResponse> {
    const response = await api.get('/measurements/trends', { params: { days } });
    return response.data;
  },
};
