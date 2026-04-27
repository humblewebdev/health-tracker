import { Router } from 'express';
import authController from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

// Protected routes
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));
router.put('/me', authenticate, (req, res) => authController.updateMe(req, res));

export default router;
