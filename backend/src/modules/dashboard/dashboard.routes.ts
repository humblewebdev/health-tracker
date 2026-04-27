import { Router } from 'express';
import dashboardController from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard endpoints
router.get('/', (req, res) => dashboardController.getDashboardData(req, res));
router.get('/trends', (req, res) => dashboardController.getTrendsData(req, res));

export default router;
