import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import measurementsService from './measurements.service';
import {
  createMeasurementSchema,
  updateMeasurementSchema,
  getMeasurementsQuerySchema,
} from './measurements.validation';
import { z } from 'zod';

export class MeasurementsController {
  async createMeasurement(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = createMeasurementSchema.parse(req.body);
      const measurement = await measurementsService.createMeasurement(
        req.user.userId,
        validatedData
      );

      res.status(201).json({ measurement });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create measurement' });
      }
    }
  }

  async getMeasurements(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = getMeasurementsQuerySchema.parse(req.query);
      const measurements = await measurementsService.getMeasurements(req.user.userId, query);

      res.status(200).json({ measurements });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to fetch measurements' });
      }
    }
  }

  async getMeasurement(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const measurement = await measurementsService.getMeasurementById(
        req.params.id,
        req.user.userId
      );

      res.status(200).json({ measurement });
    } catch (error) {
      if (error instanceof Error && error.message === 'Measurement not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch measurement' });
      }
    }
  }

  async updateMeasurement(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedData = updateMeasurementSchema.parse(req.body);
      const measurement = await measurementsService.updateMeasurement(
        req.params.id,
        req.user.userId,
        validatedData
      );

      res.status(200).json({ measurement });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error instanceof Error && error.message === 'Measurement not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update measurement' });
      }
    }
  }

  async deleteMeasurement(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await measurementsService.deleteMeasurement(req.params.id, req.user.userId);

      res.status(200).json({ message: 'Measurement deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Measurement not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete measurement' });
      }
    }
  }

  async getLatest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const measurementType = req.query.type as string | undefined;
      const measurement = await measurementsService.getLatestMeasurement(
        req.user.userId,
        measurementType
      );

      if (!measurement) {
        res.status(404).json({ error: 'No measurements found' });
        return;
      }

      res.status(200).json({ measurement });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest measurement' });
    }
  }

  async getWeightTrends(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const trends = await measurementsService.getWeightTrends(req.user.userId, days);

      res.status(200).json(trends);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weight trends' });
    }
  }
}

export default new MeasurementsController();
