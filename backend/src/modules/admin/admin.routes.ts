import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware';
import { getStats, getUsers, deleteUser, toggleAdmin } from './admin.controller';

const router = Router();

router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-admin', toggleAdmin);

export default router;
