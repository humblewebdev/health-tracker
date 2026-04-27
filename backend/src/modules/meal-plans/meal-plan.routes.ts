import { Router } from 'express';
import mealPlanController from './meal-plan.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All meal plan routes require authentication
router.use(authenticate);

// Meal plan endpoints
router.post('/generate', (req, res) => mealPlanController.generateMealPlan(req, res));
router.get('/', (req, res) => mealPlanController.getMealPlans(req, res));
router.get('/active', (req, res) => mealPlanController.getActiveMealPlan(req, res));
router.get('/:id', (req, res) => mealPlanController.getMealPlan(req, res));
router.put('/:id', (req, res) => mealPlanController.updateMealPlan(req, res));
router.delete('/:id', (req, res) => mealPlanController.deleteMealPlan(req, res));
router.post('/:id/activate', (req, res) => mealPlanController.activateMealPlan(req, res));
router.post('/:id/apply', (req, res) => mealPlanController.applyMealPlanToDay(req, res));
router.post('/:id/meals/:mealId/swap', (req, res) => mealPlanController.swapMeal(req, res));
router.get('/:id/shopping-list', (req, res) => mealPlanController.getShoppingList(req, res));

export default router;
