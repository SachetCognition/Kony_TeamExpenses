import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import prisma from '../lib/prisma';

const router = Router();
const dashboardService = new DashboardService(prisma);

/** FR-006 + FR-007: GET /api/dashboard/summary */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await dashboardService.getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

/** FR-007: GET /api/dashboard/employee-shares */
router.get('/employee-shares', async (_req: Request, res: Response) => {
  try {
    const shares = await dashboardService.getEmployeeShares();
    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee shares' });
  }
});

/** FR-008: GET /api/dashboard/by-category */
router.get('/by-category', async (_req: Request, res: Response) => {
  try {
    const categories = await dashboardService.getExpensesByCategory();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category expenses' });
  }
});

export default router;
