import api from './api';

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalFoodEntries: number;
  totalExercises: number;
  totalWaterIntakes: number;
  totalMeasurements: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    foodEntries: number;
    exercises: number;
    waterIntakes: number;
    measurements: number;
  };
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  toggleAdmin: async (id: string): Promise<{ id: string; isAdmin: boolean }> => {
    const { data } = await api.patch(`/admin/users/${id}/toggle-admin`);
    return data;
  },
};
