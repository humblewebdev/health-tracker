import { Router } from 'express';
import waterController from './water.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All water routes require authentication
router.use(authenticate);

// Quick add endpoint
router.post('/quick-add', (req, res) => waterController.quickAdd(req, res));

// CRUD operations
router.post('/', (req, res) => waterController.createWaterIntake(req, res));
router.get('/', (req, res) => waterController.getWaterIntakes(req, res));
router.get('/summary', (req, res) => waterController.getDailySummary(req, res));
router.get('/:id', (req, res) => waterController.getWaterIntake(req, res));
router.put('/:id', (req, res) => waterController.updateWaterIntake(req, res));
router.delete('/:id', (req, res) => waterController.deleteWaterIntake(req, res));

export default router;
