import prisma from '../../database/client';
import {
  CreateMeasurementInput,
  UpdateMeasurementInput,
  GetMeasurementsQuery,
} from './measurements.validation';

export class MeasurementsService {
  // Helper to calculate BMI
  calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  }

  async createMeasurement(userId: string, data: CreateMeasurementInput) {
    // Auto-calculate BMI if weight is provided and user has height
    let bmi = data.bmi;

    if (data.weight && !bmi) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { height: true },
      });

      if (user?.height) {
        bmi = this.calculateBMI(data.weight, user.height);
      }
    }

    return prisma.measurement.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
        bmi,
      },
    });
  }

  async getMeasurements(userId: string, query: GetMeasurementsQuery) {
    const where: any = { userId };

    if (query.measurementType) {
      where.measurementType = query.measurementType;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    return prisma.measurement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: query.limit || undefined,
    });
  }

  async getMeasurementById(id: string, userId: string) {
    const measurement = await prisma.measurement.findFirst({
      where: { id, userId },
    });

    if (!measurement) {
      throw new Error('Measurement not found');
    }

    return measurement;
  }

  async updateMeasurement(id: string, userId: string, data: UpdateMeasurementInput) {
    // Verify ownership
    await this.getMeasurementById(id, userId);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // Recalculate BMI if weight is updated
    if (data.weight && !data.bmi) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { height: true },
      });

      if (user?.height) {
        updateData.bmi = this.calculateBMI(data.weight, user.height);
      }
    }

    return prisma.measurement.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMeasurement(id: string, userId: string) {
    // Verify ownership
    await this.getMeasurementById(id, userId);

    return prisma.measurement.delete({
      where: { id },
    });
  }

  async getLatestMeasurement(userId: string, measurementType?: string) {
    const where: any = { userId };
    if (measurementType) {
      where.measurementType = measurementType;
    }

    return prisma.measurement.findFirst({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getWeightTrends(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const measurements = await prisma.measurement.findMany({
      where: {
        userId,
        measurementType: 'WEIGHT',
        weight: { not: null },
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
        bmi: true,
      },
    });

    // Calculate statistics
    const weights = measurements.map(m => m.weight!).filter(w => w > 0);
    const stats = {
      current: weights.length > 0 ? weights[weights.length - 1] : null,
      average: weights.length > 0
        ? parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1))
        : null,
      min: weights.length > 0 ? Math.min(...weights) : null,
      max: weights.length > 0 ? Math.max(...weights) : null,
      change: weights.length >= 2
        ? parseFloat((weights[weights.length - 1] - weights[0]).toFixed(1))
        : null,
    };

    return {
      measurements,
      stats,
    };
  }
}

export default new MeasurementsService();
