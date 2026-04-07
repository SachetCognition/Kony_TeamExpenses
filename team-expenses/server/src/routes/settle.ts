import { Router, Request, Response } from 'express';
import { SettleService } from '../services/settleService';
import prisma from '../lib/prisma';

const router = Router();
const settleService = new SettleService(prisma);

/** FR-002: POST /api/settle - Settle an employee expense */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { expenseId, employeeId } = req.body;
    const result = await settleService.settleUp(Number(expenseId), employeeId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Employee expense record not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to settle expense' });
  }
});

export default router;
