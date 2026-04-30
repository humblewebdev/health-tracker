import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '../database/client';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    return;
  }

  next();
};
