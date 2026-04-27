import prisma from '../../database/client';
import {
  CreateExerciseInput,
  UpdateExerciseInput,
  GetExercisesQuery,
} from './exercise.validation';

export class ExerciseService {
  async createExercise(userId: string, data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        userId,
        date: new Date(data.date),
        time: data.time ? new Date(data.time) : new Date(),
        exerciseType: data.exerciseType,
        name: data.name,
        duration: data.duration,
        caloriesBurned: data.caloriesBurned,
        intensity: data.intensity,
        distance: data.distance,
        averageHeartRate: data.averageHeartRate,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        notes: data.notes,
      },
    });
  }

  async getExercises(userId: string, query: GetExercisesQuery) {
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

    if (query.exerciseType) {
      where.exerciseType = query.exerciseType;
    }

    return prisma.exercise.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
  }

  async getExerciseById(id: string, userId: string) {
    const exercise = await prisma.exercise.findFirst({
      where: { id, userId },
    });

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    return exercise;
  }

  async updateExercise(id: string, userId: string, data: UpdateExerciseInput) {
    // Verify ownership
    await this.getExerciseById(id, userId);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.time) {
      updateData.time = new Date(data.time);
    }

    return prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteExercise(id: string, userId: string) {
    // Verify ownership
    await this.getExerciseById(id, userId);

    return prisma.exercise.delete({
      where: { id },
    });
  }

  async getDailySummary(userId: string, date: string) {
    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
        date: new Date(date),
      },
      orderBy: { time: 'asc' },
    });

    const totalDuration = exercises.reduce(
      (sum, ex) => sum + (ex.duration || 0),
      0
    );
    const totalCalories = exercises.reduce(
      (sum, ex) => sum + (ex.caloriesBurned || 0),
      0
    );
    const totalDistance = exercises.reduce(
      (sum, ex) => sum + (ex.distance || 0),
      0
    );

    // Group by exercise type
    const typeBreakdown: any = {
      CARDIO: { count: 0, duration: 0, calories: 0 },
      STRENGTH: { count: 0, duration: 0, calories: 0 },
      SPORTS: { count: 0, duration: 0, calories: 0 },
      FLEXIBILITY: { count: 0, duration: 0, calories: 0 },
      OTHER: { count: 0, duration: 0, calories: 0 },
    };

    exercises.forEach((exercise) => {
      const type = exercise.exerciseType;
      typeBreakdown[type].count++;
      typeBreakdown[type].duration += exercise.duration || 0;
      typeBreakdown[type].calories += exercise.caloriesBurned || 0;
    });

    return {
      date,
      totalDuration,
      totalCalories,
      totalDistance,
      count: exercises.length,
      typeBreakdown,
      exercises,
    };
  }

  async getWeeklySummary(userId: string, startDate: string, endDate: string) {
    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalDuration = exercises.reduce(
      (sum, ex) => sum + (ex.duration || 0),
      0
    );
    const totalCalories = exercises.reduce(
      (sum, ex) => sum + (ex.caloriesBurned || 0),
      0
    );
    const totalDistance = exercises.reduce(
      (sum, ex) => sum + (ex.distance || 0),
      0
    );

    return {
      startDate,
      endDate,
      totalDuration,
      totalCalories,
      totalDistance,
      count: exercises.length,
      averageDuration: exercises.length > 0 ? Math.round(totalDuration / exercises.length) : 0,
      averageCalories: exercises.length > 0 ? Math.round(totalCalories / exercises.length) : 0,
    };
  }
}

export default new ExerciseService();
