import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import dashboardService from './dashboard.service';

export class DashboardController {
  async getDashboardData(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const data = await dashboardService.getDashboardData(req.user.userId, date);

      res.status(200).json({ data });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  async getTrendsData(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const trends = await dashboardService.getTrendsData(
        req.user.userId,
        startDate,
        endDate
      );

      res.status(200).json({ trends });
    } catch (error) {
      console.error('Failed to fetch trends data:', error);
      res.status(500).json({ error: 'Failed to fetch trends data' });
    }
  }
}

export default new DashboardController();
