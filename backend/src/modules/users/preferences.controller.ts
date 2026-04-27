import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import preferencesService from './preferences.service';
import { updatePreferencesSchema } from './preferences.validation';
import { z } from 'zod';

export class PreferencesController {
  async getPreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const preferences = await preferencesService.getPreferences(req.user.userId);

      res.status(200).json({ preferences });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updatePreferencesSchema.parse(req.body);
      const preferences = await preferencesService.updatePreferences(
        req.user.userId,
        validatedData
      );

      res.status(200).json({ preferences });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update preferences' });
      }
    }
  }
}

export default new PreferencesController();
