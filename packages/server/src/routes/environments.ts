import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

export const environmentRouter = Router();

environmentRouter.use(authenticateUser);

environmentRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const environments = await prisma.environment.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        key: true,
        apiKey: true,
        createdAt: true,
      },
    });

    res.json({ environments });
    return;
  } catch (error) {
    console.error('Failed to fetch environments:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});
