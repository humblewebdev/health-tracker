import prisma from '../../database/client';

class AdminService {
  async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      newUsersThisWeek,
      totalFoodEntries,
      totalExercises,
      totalWaterIntakes,
      totalMeasurements,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.foodEntry.count(),
      prisma.exercise.count(),
      prisma.waterIntake.count(),
      prisma.measurement.count(),
    ]);

    return {
      totalUsers,
      newUsersThisWeek,
      totalFoodEntries,
      totalExercises,
      totalWaterIntakes,
      totalMeasurements,
    };
  }

  async getUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            foodEntries: true,
            exercises: true,
            waterIntakes: true,
            measurements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }

  async toggleAdmin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user) throw new Error('User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { isAdmin: !user.isAdmin },
      select: { id: true, isAdmin: true },
    });
  }
}

export default new AdminService();
