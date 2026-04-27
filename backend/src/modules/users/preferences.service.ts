import prisma from '../../database/client';
import { UpdatePreferencesInput } from './preferences.validation';

export class PreferencesService {
  async getPreferences(userId: string) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async updatePreferences(userId: string, data: UpdatePreferencesInput) {
    // Get or create preferences
    await this.getPreferences(userId);

    return prisma.userPreferences.update({
      where: { userId },
      data,
    });
  }
}

export default new PreferencesService();
