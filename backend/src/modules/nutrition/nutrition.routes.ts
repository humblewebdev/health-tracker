import { Router } from 'express';
import nutritionController from './nutrition.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All nutrition routes require authentication
router.use(authenticate);

// Food Entries
router.post('/entries', (req, res) => nutritionController.createFoodEntry(req, res));
router.get('/entries', (req, res) => nutritionController.getFoodEntries(req, res));
router.get('/entries/:id', (req, res) => nutritionController.getFoodEntry(req, res));
router.put('/entries/:id', (req, res) => nutritionController.updateFoodEntry(req, res));
router.delete('/entries/:id', (req, res) => nutritionController.deleteFoodEntry(req, res));

// Daily Summary
router.get('/summary', (req, res) => nutritionController.getDailySummary(req, res));

// Custom Foods
router.post('/foods/custom', (req, res) => nutritionController.createCustomFood(req, res));
router.get('/foods/custom', (req, res) => nutritionController.getCustomFoods(req, res));
router.get('/foods/custom/:id', (req, res) => nutritionController.getCustomFood(req, res));
router.put('/foods/custom/:id', (req, res) => nutritionController.updateCustomFood(req, res));
router.delete('/foods/custom/:id', (req, res) => nutritionController.deleteCustomFood(req, res));

export default router;
