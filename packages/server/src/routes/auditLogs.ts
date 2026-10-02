import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

export const auditLogRouter = Router();

auditLogRouter.use(authenticateUser);

auditLogRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({ auditLogs });
    return;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});
