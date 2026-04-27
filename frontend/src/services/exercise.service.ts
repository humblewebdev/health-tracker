import api from './api';
import { Exercise, ExerciseType, Intensity } from '../types';

export interface CreateExerciseData {
  date: string;
  exerciseType: ExerciseType;
  name: string;
  duration?: number;
  caloriesBurned?: number;
  intensity?: Intensity;
  distance?: number;
  averageHeartRate?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  time?: string;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {}

export interface GetExercisesQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  exerciseType?: ExerciseType;
}

export interface ExerciseSummary {
  date: string;
  totalDuration: number;
  totalCalories: number;
  totalDistance: number;
  count: number;
  typeBreakdown: {
    CARDIO: { count: number; duration: number; calories: number };
    STRENGTH: { count: number; duration: number; calories: number };
    SPORTS: { count: number; duration: number; calories: number };
    FLEXIBILITY: { count: number; duration: number; calories: number };
    OTHER: { count: number; duration: number; calories: number };
  };
  exercises: Exercise[];
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  totalDuration: number;
  totalCalories: number;
  totalDistance: number;
  count: number;
  averageDuration: number;
  averageCalories: number;
}

export const exerciseService = {
  async createExercise(data: CreateExerciseData): Promise<{ exercise: Exercise }> {
    const response = await api.post('/exercises', data);
    return response.data;
  },

  async getExercises(query?: GetExercisesQuery): Promise<{ exercises: Exercise[] }> {
    const response = await api.get('/exercises', { params: query });
    return response.data;
  },

  async getExercise(id: string): Promise<{ exercise: Exercise }> {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  async updateExercise(id: string, data: UpdateExerciseData): Promise<{ exercise: Exercise }> {
    const response = await api.put(`/exercises/${id}`, data);
    return response.data;
  },

  async deleteExercise(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },

  async getDailySummary(date: string): Promise<{ summary: ExerciseSummary }> {
    const response = await api.get('/exercises/summary/daily', { params: { date } });
    return response.data;
  },

  async getWeeklySummary(startDate: string, endDate: string): Promise<{ summary: WeeklySummary }> {
    const response = await api.get('/exercises/summary/weekly', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
