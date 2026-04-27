import { Router } from 'express';
import measurementsController from './measurements.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All measurements routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', (req, res) => measurementsController.createMeasurement(req, res));
router.get('/', (req, res) => measurementsController.getMeasurements(req, res));
router.get('/latest', (req, res) => measurementsController.getLatest(req, res));
router.get('/trends', (req, res) => measurementsController.getWeightTrends(req, res));
router.get('/:id', (req, res) => measurementsController.getMeasurement(req, res));
router.put('/:id', (req, res) => measurementsController.updateMeasurement(req, res));
router.delete('/:id', (req, res) => measurementsController.deleteMeasurement(req, res));

export default router;
