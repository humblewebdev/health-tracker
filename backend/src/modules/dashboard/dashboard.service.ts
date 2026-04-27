import { prisma } from '../../database/prisma';
import nutritionService from '../nutrition/nutrition.service';
import exerciseService from '../exercise/exercise.service';
import waterService from '../water/water.service';
import measurementsService from '../measurements/measurements.service';

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
    change: number | null; // vs yesterday
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
    change: number; // total change over period
    trend: 'up' | 'down' | 'stable';
  };
}

class DashboardService {
  async getDashboardData(userId: string, date: string): Promise<DashboardData> {
    // Get user preferences for goals
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Get nutrition summary
    const nutritionSummary = await nutritionService.getDailySummary(userId, date);

    // Get exercise summary
    const exerciseSummary = await exerciseService.getDailySummary(userId, date);

    // Get water summary
    const waterSummary = await waterService.getDailySummary(userId, date);

    // Get latest weight measurement
    const latestWeight = await prisma.measurement.findFirst({
      where: {
        userId,
        measurementType: 'WEIGHT',
        date: {
          lte: new Date(date),
        },
      },
      orderBy: { date: 'desc' },
    });

    // Get yesterday's weight for comparison
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayWeight = await prisma.measurement.findFirst({
      where: {
        userId,
        measurementType: 'WEIGHT',
        date: {
          lte: yesterday,
        },
      },
      orderBy: { date: 'desc' },
    });

    const weightChange = latestWeight && yesterdayWeight
      ? parseFloat((latestWeight.weight! - yesterdayWeight.weight!).toFixed(1))
      : null;

    return {
      date,
      nutrition: {
        totalCalories: nutritionSummary.totalCalories,
        totalProtein: nutritionSummary.totalProtein,
        totalCarbs: nutritionSummary.totalCarbs,
        totalFats: nutritionSummary.totalFats,
        mealCount: nutritionSummary.mealBreakdown.breakfast.count +
          nutritionSummary.mealBreakdown.lunch.count +
          nutritionSummary.mealBreakdown.dinner.count +
          nutritionSummary.mealBreakdown.snack.count,
        goals: {
          calories: preferences?.dailyCalorieGoal || 2000,
          protein: preferences?.dailyProteinGoal || 150,
          carbs: preferences?.dailyCarbsGoal || 200,
          fats: preferences?.dailyFatsGoal || 65,
        },
      },
      exercise: {
        totalDuration: exerciseSummary.totalDuration,
        totalCalories: exerciseSummary.totalCalories,
        totalDistance: exerciseSummary.totalDistance,
        count: exerciseSummary.count,
      },
      water: {
        totalAmount: waterSummary.totalAmount,
        goal: preferences?.dailyWaterGoal || 2000,
        percentage: Math.round(
          (waterSummary.totalAmount / (preferences?.dailyWaterGoal || 2000)) * 100
        ),
        count: waterSummary.count,
      },
      weight: {
        current: latestWeight?.weight || null,
        bmi: latestWeight?.bmi || null,
        change: weightChange,
      },
    };
  }

  async getTrendsData(userId: string, startDate: string, endDate: string): Promise<TrendsData> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate array of dates in range
    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }

    // Get nutrition data for each day
    const nutritionDaily = await Promise.all(
      dates.map(async (date) => {
        const summary = await nutritionService.getDailySummary(userId, date);
        return {
          date,
          calories: summary.totalCalories,
          protein: summary.totalProtein,
          carbs: summary.totalCarbs,
          fats: summary.totalFats,
        };
      })
    );

    // Calculate nutrition averages
    const nutritionAverages = {
      calories: Math.round(
        nutritionDaily.reduce((sum, day) => sum + day.calories, 0) / dates.length
      ),
      protein: Math.round(
        nutritionDaily.reduce((sum, day) => sum + day.protein, 0) / dates.length
      ),
      carbs: Math.round(
        nutritionDaily.reduce((sum, day) => sum + day.carbs, 0) / dates.length
      ),
      fats: Math.round(
        nutritionDaily.reduce((sum, day) => sum + day.fats, 0) / dates.length
      ),
    };

    // Get exercise data for each day
    const exerciseDaily = await Promise.all(
      dates.map(async (date) => {
        const summary = await exerciseService.getDailySummary(userId, date);
        return {
          date,
          duration: summary.totalDuration,
          calories: summary.totalCalories,
          distance: summary.totalDistance,
        };
      })
    );

    // Calculate exercise totals
    const exerciseTotals = {
      duration: exerciseDaily.reduce((sum, day) => sum + day.duration, 0),
      calories: exerciseDaily.reduce((sum, day) => sum + day.calories, 0),
      distance: parseFloat(
        exerciseDaily.reduce((sum, day) => sum + day.distance, 0).toFixed(1)
      ),
      count: exerciseDaily.filter((day) => day.duration > 0).length,
    };

    // Get water data for each day
    const waterDaily = await Promise.all(
      dates.map(async (date) => {
        const summary = await waterService.getDailySummary(userId, date);
        return {
          date,
          amount: summary.totalAmount,
        };
      })
    );

    // Calculate water average
    const waterAverage = Math.round(
      waterDaily.reduce((sum, day) => sum + day.amount, 0) / dates.length
    );

    // Get weight measurements in range
    const weightMeasurements = await prisma.measurement.findMany({
      where: {
        userId,
        measurementType: 'WEIGHT',
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
      },
    });

    const weightData = weightMeasurements.map((m) => ({
      date: m.date.toISOString().split('T')[0],
      weight: m.weight!,
    }));

    // Calculate weight change
    let weightChange = 0;
    let weightTrend: 'up' | 'down' | 'stable' = 'stable';

    if (weightData.length >= 2) {
      weightChange = parseFloat(
        (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
      );
      if (weightChange > 0.5) weightTrend = 'up';
      else if (weightChange < -0.5) weightTrend = 'down';
    }

    return {
      startDate,
      endDate,
      nutrition: {
        daily: nutritionDaily,
        averages: nutritionAverages,
      },
      exercise: {
        daily: exerciseDaily,
        totals: exerciseTotals,
      },
      water: {
        daily: waterDaily,
        average: waterAverage,
      },
      weight: {
        data: weightData,
        change: weightChange,
        trend: weightTrend,
      },
    };
  }
}

export default new DashboardService();
