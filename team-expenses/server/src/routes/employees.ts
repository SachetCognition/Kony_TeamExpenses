import { Router, Request, Response } from 'express';
import { EmployeeService } from '../services/employeeService';
import { SettleService } from '../services/settleService';
import prisma from '../lib/prisma';

const router = Router();
const employeeService = new EmployeeService(prisma);
const settleService = new SettleService(prisma);

/** FR-016 + FR-011: GET /api/employees */
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const employees = search
      ? await employeeService.searchEmployees(search)
      : await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

/** FR-009: GET /api/employees/:id/unsettled */
router.get('/:id/unsettled', async (req: Request, res: Response) => {
  try {
    const unsettled = await settleService.getUnsettledExpenses(req.params.id);
    const formatted = unsettled.map((ue) => ({
      expenseId: ue.expenseId,
      expenseName: ue.expense.name,
      employeeShare: Number(ue.employeeShare),
      comment: ue.comment,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unsettled expenses' });
  }
});

/** FR-016: POST /api/employees */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, isAdmin } = req.body;
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Employee name is required' });
    }
    const employee = await employeeService.createEmployee({
      id: id.trim(),
      name: name.trim(),
      isAdmin: isAdmin === true,
    });
    res.status(201).json(employee);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

/** FR-016: PUT /api/employees/:id */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, isAdmin } = req.body;
    const employee = await employeeService.updateEmployee(req.params.id, { name, isAdmin });
    res.json(employee);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

/** FR-016: DELETE /api/employees/:id */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
