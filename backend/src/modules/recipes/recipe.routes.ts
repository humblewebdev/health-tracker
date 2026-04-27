import { Router } from 'express';
import recipeController from './recipe.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All recipe routes require authentication
router.use(authenticate);

// Recipe endpoints
router.post('/', (req, res) => recipeController.createRecipe(req, res));
router.get('/', (req, res) => recipeController.getRecipes(req, res));
router.get('/search', (req, res) => recipeController.searchRecipes(req, res));
router.get('/:id', (req, res) => recipeController.getRecipe(req, res));
router.put('/:id', (req, res) => recipeController.updateRecipe(req, res));
router.delete('/:id', (req, res) => recipeController.deleteRecipe(req, res));

export default router;
