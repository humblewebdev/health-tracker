import api from './api';

export interface DashboardData {
  date: string;
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    mealCount: number;
    goals: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  exercise: {
    totalDuration: number;
    totalCalories: number;
    totalDistance: number;
    count: number;
  };
  water: {
    totalAmount: number;
    goal: number;
    percentage: number;
    count: number;
  };
  weight: {
    current: number | null;
    bmi: number | null;
    change: number | null;
  };
}

export interface TrendsData {
  startDate: string;
  endDate: string;
  nutrition: {
    daily: Array<{
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
    averages: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  exercise: {
    daily: Array<{
      date: string;
      duration: number;
      calories: number;
      distance: number;
    }>;
    totals: {
      duration: number;
      calories: number;
      distance: number;
      count: number;
    };
  };
  water: {
    daily: Array<{
      date: string;
      amount: number;
    }>;
    average: number;
  };
  weight: {
    data: Array<{
      date: string;
      weight: number;
    }>;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export const dashboardService = {
  async getDashboardData(date?: string): Promise<{ data: DashboardData }> {
    const response = await api.get('/dashboard', { params: { date } });
    return response.data;
  },

  async getTrendsData(startDate: string, endDate: string): Promise<{ trends: TrendsData }> {
    const response = await api.get('/dashboard/trends', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
