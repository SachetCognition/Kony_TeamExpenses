import { Router, Request, Response } from 'express';
import { ExpenseService } from '../services/expenseService';
import prisma from '../lib/prisma';

const router = Router();
const expenseService = new ExpenseService(prisma);

/** FR-005: GET /api/expenses - List all expenses with category */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getAllExpenses();
    const formatted = expenses.map((e) => ({
      id: e.id,
      name: e.name,
      expenditure: Number(e.expenditure),
      categoryId: e.categoryId,
      categoryName: e.category.name,
      date: e.date.toISOString().substring(0, 10),
      employees: e.employees.map((ee) => ({
        employeeId: ee.employeeId,
        employeeShare: Number(ee.employeeShare),
        status: ee.status,
        comment: ee.comment,
      })),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

/** Get single expense by ID */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await expenseService.getExpenseById(Number(req.params.id));
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({
      id: expense.id,
      name: expense.name,
      expenditure: Number(expense.expenditure),
      categoryId: expense.categoryId,
      categoryName: expense.category.name,
      date: expense.date.toISOString().substring(0, 10),
      employees: expense.employees.map((ee) => ({
        employeeId: ee.employeeId,
        employeeName: ee.employee.name,
        employeeShare: Number(ee.employeeShare),
        status: ee.status,
        comment: ee.comment,
      })),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

/** FR-001: POST /api/expenses - Create expense with equal split */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, expenditure, categoryId, employeeIds, comment, date } = req.body;
    const expense = await expenseService.createExpenseWithSplit({
      name,
      expenditure: Number(expenditure),
      categoryId: Number(categoryId),
      employeeIds,
      comment,
      date,
    });
    res.status(201).json(expense);
  } catch (error: any) {
    if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('At least')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

/** FR-003: PUT /api/expenses/:id - Update expense with re-split */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, expenditure, categoryId, employeeIds, comment, date } = req.body;
    const expense = await expenseService.updateExpenseWithResplit(
      Number(req.params.id),
      {
        name,
        expenditure: Number(expenditure),
        categoryId: Number(categoryId),
        employeeIds,
        comment,
        date,
      }
    );
    res.json(expense);
  } catch (error: any) {
    if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('At least')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

/** FR-004: DELETE /api/expenses/:id - Delete expense (cascade) */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await expenseService.deleteExpense(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
