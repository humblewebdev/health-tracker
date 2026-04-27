import { Router } from 'express';
import exerciseController from './exercise.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All exercise routes require authentication
router.use(authenticate);

// Summary endpoints
router.get('/summary/daily', (req, res) => exerciseController.getDailySummary(req, res));
router.get('/summary/weekly', (req, res) => exerciseController.getWeeklySummary(req, res));

// CRUD operations
router.post('/', (req, res) => exerciseController.createExercise(req, res));
router.get('/', (req, res) => exerciseController.getExercises(req, res));
router.get('/:id', (req, res) => exerciseController.getExercise(req, res));
router.put('/:id', (req, res) => exerciseController.updateExercise(req, res));
router.delete('/:id', (req, res) => exerciseController.deleteExercise(req, res));

export default router;
