import { Router } from 'express';
import preferencesController from './preferences.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All preferences routes require authentication
router.use(authenticate);

router.get('/', (req, res) => preferencesController.getPreferences(req, res));
router.put('/', (req, res) => preferencesController.updatePreferences(req, res));

export default router;
