import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseService } from '../../src/services/expenseService';

const mockPrisma = {
  $transaction: vi.fn(),
  expense: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  employeeExpense: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
} as any;

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExpenseService(mockPrisma);
  });

  describe('createExpenseWithSplit', () => {
    // TC-U-001: correctly calculates individualShare
    it('TC-U-001: calculates individualShare correctly (3000 / 3 = 1000)', async () => {
      const mockExpense = { id: 1, name: 'Lunch', expenditure: 3000, categoryId: 1 };
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        return fn(mockPrisma);
      });
      mockPrisma.expense.create.mockResolvedValue(mockExpense);
      mockPrisma.employeeExpense.createMany.mockResolvedValue({ count: 3 });

      await service.createExpenseWithSplit({
        name: 'Lunch',
        expenditure: 3000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002', 'EMP003'],
      });

      expect(mockPrisma.employeeExpense.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ employeeShare: 1000, employeeId: 'EMP001' }),
          expect.objectContaining({ employeeShare: 1000, employeeId: 'EMP002' }),
          expect.objectContaining({ employeeShare: 1000, employeeId: 'EMP003' }),
        ]),
      });
    });

    // TC-U-002: rejects empty name
    it('TC-U-002: rejects empty name', async () => {
      await expect(
        service.createExpenseWithSplit({
          name: '',
          expenditure: 1000,
          categoryId: 1,
          employeeIds: ['EMP001'],
        })
      ).rejects.toThrow('Expense name is required');
    });

    // TC-U-003: rejects zero expenditure
    it('TC-U-003: rejects zero expenditure', async () => {
      await expect(
        service.createExpenseWithSplit({
          name: 'Test',
          expenditure: 0,
          categoryId: 1,
          employeeIds: ['EMP001'],
        })
      ).rejects.toThrow('Expenditure must be greater than 0');
    });

    // TC-U-004: rejects empty employee list
    it('TC-U-004: rejects empty employee list', async () => {
      await expect(
        service.createExpenseWithSplit({
          name: 'Test',
          expenditure: 1000,
          categoryId: 1,
          employeeIds: [],
        })
      ).rejects.toThrow('At least one employee is required');
    });
  });

  describe('updateExpenseWithResplit', () => {
    // TC-U-005: adds new employees
    it('TC-U-005: adds new employees to split', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => fn(mockPrisma));
      mockPrisma.employeeExpense.findMany.mockResolvedValue([
        { employeeId: 'EMP001', expenseId: 1 },
      ]);
      mockPrisma.employeeExpense.upsert.mockResolvedValue({});
      mockPrisma.employeeExpense.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.expense.update.mockResolvedValue({ id: 1 });

      await service.updateExpenseWithResplit(1, {
        name: 'Lunch',
        expenditure: 2000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002'],
      });

      expect(mockPrisma.employeeExpense.upsert).toHaveBeenCalledTimes(2);
    });

    // TC-U-006: removes deselected employees (bug fix)
    it('TC-U-006: removes deselected employees from split', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => fn(mockPrisma));
      mockPrisma.employeeExpense.findMany.mockResolvedValue([
        { employeeId: 'EMP001', expenseId: 1 },
        { employeeId: 'EMP002', expenseId: 1 },
        { employeeId: 'EMP003', expenseId: 1 },
      ]);
      mockPrisma.employeeExpense.upsert.mockResolvedValue({});
      mockPrisma.employeeExpense.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.expense.update.mockResolvedValue({ id: 1 });

      await service.updateExpenseWithResplit(1, {
        name: 'Lunch',
        expenditure: 2000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002'],
      });

      expect(mockPrisma.employeeExpense.deleteMany).toHaveBeenCalledWith({
        where: {
          expenseId: 1,
          employeeId: { in: ['EMP003'] },
        },
      });
    });

    // TC-U-007: recalculates shares correctly
    it('TC-U-007: recalculates shares correctly', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => fn(mockPrisma));
      mockPrisma.employeeExpense.findMany.mockResolvedValue([]);
      mockPrisma.employeeExpense.upsert.mockResolvedValue({});
      mockPrisma.employeeExpense.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.expense.update.mockResolvedValue({ id: 1 });

      await service.updateExpenseWithResplit(1, {
        name: 'Lunch',
        expenditure: 3000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002', 'EMP003'],
      });

      expect(mockPrisma.employeeExpense.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ employeeShare: 1000 }),
          create: expect.objectContaining({ employeeShare: 1000 }),
        })
      );
    });
  });

  describe('deleteExpense', () => {
    // TC-U-008: cascades to employee_expense
    it('TC-U-008: deletes expense (cascade handles employee_expense)', async () => {
      mockPrisma.expense.delete.mockResolvedValue({ id: 1 });

      await service.deleteExpense(1);

      expect(mockPrisma.expense.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
