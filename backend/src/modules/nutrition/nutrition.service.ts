import prisma from '../../database/client';
import {
  CreateFoodEntryInput,
  UpdateFoodEntryInput,
  GetFoodEntriesQuery,
  CreateCustomFoodInput,
  UpdateCustomFoodInput,
} from './nutrition.validation';

export class NutritionService {
  // Food Entries
  async createFoodEntry(userId: string, data: CreateFoodEntryInput) {
    return prisma.foodEntry.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
      },
    });
  }

  async getFoodEntries(userId: string, query: GetFoodEntriesQuery) {
    const where: any = { userId };

    if (query.date) {
      where.date = new Date(query.date);
    } else if (query.startDate && query.endDate) {
      where.date = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    if (query.mealType) {
      where.mealType = query.mealType;
    }

    return prisma.foodEntry.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
  }

  async getFoodEntryById(id: string, userId: string) {
    const entry = await prisma.foodEntry.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      throw new Error('Food entry not found');
    }

    return entry;
  }

  async updateFoodEntry(id: string, userId: string, data: UpdateFoodEntryInput) {
    // Verify ownership
    await this.getFoodEntryById(id, userId);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return prisma.foodEntry.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteFoodEntry(id: string, userId: string) {
    // Verify ownership
    await this.getFoodEntryById(id, userId);

    return prisma.foodEntry.delete({
      where: { id },
    });
  }

  async getDailySummary(userId: string, date: string) {
    const entries = await prisma.foodEntry.findMany({
      where: {
        userId,
        date: new Date(date),
      },
    });

    const summary = {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalFiber: 0,
      totalSugar: 0,
      totalSodium: 0,
      mealBreakdown: {
        BREAKFAST: { count: 0, calories: 0 },
        LUNCH: { count: 0, calories: 0 },
        DINNER: { count: 0, calories: 0 },
        SNACK: { count: 0, calories: 0 },
      },
      entries,
    };

    entries.forEach((entry) => {
      summary.totalCalories += entry.calories;
      summary.totalProtein += entry.protein;
      summary.totalCarbs += entry.carbs;
      summary.totalFats += entry.fats;
      summary.totalFiber += entry.fiber;
      summary.totalSugar += entry.sugar;
      summary.totalSodium += entry.sodium;

      summary.mealBreakdown[entry.mealType].count++;
      summary.mealBreakdown[entry.mealType].calories += entry.calories;
    });

    return summary;
  }

  // Custom Foods
  async createCustomFood(userId: string, data: CreateCustomFoodInput) {
    return prisma.customFood.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getCustomFoods(userId: string) {
    return prisma.customFood.findMany({
      where: {
        OR: [{ userId }, { isPublic: true }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCustomFoodById(id: string, userId: string) {
    const food = await prisma.customFood.findFirst({
      where: {
        id,
        OR: [{ userId }, { isPublic: true }],
      },
    });

    if (!food) {
      throw new Error('Custom food not found');
    }

    return food;
  }

  async updateCustomFood(id: string, userId: string, data: UpdateCustomFoodInput) {
    // Verify ownership
    const food = await prisma.customFood.findFirst({
      where: { id, userId },
    });

    if (!food) {
      throw new Error('Custom food not found or unauthorized');
    }

    return prisma.customFood.update({
      where: { id },
      data,
    });
  }

  async deleteCustomFood(id: string, userId: string) {
    // Verify ownership
    const food = await prisma.customFood.findFirst({
      where: { id, userId },
    });

    if (!food) {
      throw new Error('Custom food not found or unauthorized');
    }

    return prisma.customFood.delete({
      where: { id },
    });
  }
}

export default new NutritionService();
