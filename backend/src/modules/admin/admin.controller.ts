import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import adminService from './admin.service';

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const stats = await adminService.getStats();
  res.json(stats);
};

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await adminService.getUsers();
  res.json(users);
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === req.user?.userId) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }

  await adminService.deleteUser(id);
  res.status(204).send();
};

export const toggleAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === req.user?.userId) {
    res.status(400).json({ error: 'Cannot change your own admin status' });
    return;
  }

  const updated = await adminService.toggleAdmin(id);
  res.json(updated);
};
