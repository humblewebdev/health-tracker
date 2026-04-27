import prisma from '../../database/client';
import {
  CreateWaterIntakeInput,
  UpdateWaterIntakeInput,
  GetWaterIntakesQuery,
} from './water.validation';

export class WaterService {
  async createWaterIntake(userId: string, data: CreateWaterIntakeInput) {
    return prisma.waterIntake.create({
      data: {
        userId,
        date: new Date(data.date),
        amount: data.amount,
        time: data.time ? new Date(data.time) : new Date(),
      },
    });
  }

  async getWaterIntakes(userId: string, query: GetWaterIntakesQuery) {
    const where: any = { userId };

    if (query.date) {
      where.date = new Date(query.date);
    } else if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    return prisma.waterIntake.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
  }

  async getWaterIntakeById(id: string, userId: string) {
    const intake = await prisma.waterIntake.findFirst({
      where: { id, userId },
    });

    if (!intake) {
      throw new Error('Water intake not found');
    }

    return intake;
  }

  async updateWaterIntake(id: string, userId: string, data: UpdateWaterIntakeInput) {
    // Verify ownership
    await this.getWaterIntakeById(id, userId);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.time) {
      updateData.time = new Date(data.time);
    }

    return prisma.waterIntake.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteWaterIntake(id: string, userId: string) {
    // Verify ownership
    await this.getWaterIntakeById(id, userId);

    return prisma.waterIntake.delete({
      where: { id },
    });
  }

  async getDailySummary(userId: string, date: string) {
    const intakes = await prisma.waterIntake.findMany({
      where: {
        userId,
        date: new Date(date),
      },
      orderBy: { time: 'asc' },
    });

    const totalAmount = intakes.reduce((sum, intake) => sum + intake.amount, 0);

    // Get user's daily water goal
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
      select: { dailyWaterGoal: true },
    });

    const goal = preferences?.dailyWaterGoal || 2000;
    const percentage = Math.min((totalAmount / goal) * 100, 100);

    return {
      date,
      totalAmount,
      goal,
      remaining: Math.max(0, goal - totalAmount),
      percentage: parseFloat(percentage.toFixed(1)),
      count: intakes.length,
      intakes,
    };
  }

  async quickAdd(userId: string, amount: number, date?: string) {
    const intakeDate = date ? new Date(date) : new Date();

    return this.createWaterIntake(userId, {
      date: intakeDate.toISOString().split('T')[0],
      amount,
    });
  }
}

export default new WaterService();
