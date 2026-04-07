import { PrismaClient } from '@prisma/client';

export class ExpenseService {
  constructor(private prisma: PrismaClient) {}

  /** FR-001: Add Expense with Equal Split */
  async createExpenseWithSplit(data: {
    name: string;
    expenditure: number;
    categoryId: number;
    employeeIds: string[];
    comment?: string;
    date?: string;
  }) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Expense name is required');
    }
    if (!data.expenditure || data.expenditure <= 0) {
      throw new Error('Expenditure must be greater than 0');
    }
    if (!data.employeeIds || data.employeeIds.length === 0) {
      throw new Error('At least one employee must be selected');
    }

    const individualShare = data.expenditure / data.employeeIds.length;

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          name: data.name.trim(),
          expenditure: data.expenditure,
          categoryId: data.categoryId,
          date: data.date ? new Date(data.date) : new Date(),
        },
      });

      for (const employeeId of data.employeeIds) {
        await tx.employeeExpense.create({
          data: {
            expenseId: expense.id,
            employeeId,
            employeeShare: individualShare,
            comment: data.comment || null,
            status: false,
          },
        });
      }

      return expense;
    });
  }

  /** FR-003: Update Expense with Re-split (fixes Kony bug: deletes removed employees) */
  async updateExpenseWithResplit(
    expenseId: number,
    data: {
      name: string;
      expenditure: number;
      categoryId: number;
      employeeIds: string[];
      comment?: string;
      date?: string;
    }
  ) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Expense name is required');
    }
    if (!data.expenditure || data.expenditure <= 0) {
      throw new Error('Expenditure must be greater than 0');
    }
    if (!data.employeeIds || data.employeeIds.length === 0) {
      throw new Error('At least one employee must be selected');
    }

    const individualShare = data.expenditure / data.employeeIds.length;

    return this.prisma.$transaction(async (tx) => {
      // Get existing employee_expense records
      const existing = await tx.employeeExpense.findMany({
        where: { expenseId },
        select: { employeeId: true },
      });
      const existingIds = new Set(existing.map((e) => e.employeeId));
      const newIds = new Set(data.employeeIds);

      // Delete records for removed employees (BUG FIX from Kony)
      const toDelete = [...existingIds].filter((id) => !newIds.has(id));
      if (toDelete.length > 0) {
        await tx.employeeExpense.deleteMany({
          where: {
            expenseId,
            employeeId: { in: toDelete },
          },
        });
      }

      // Update existing records
      const toUpdate = [...existingIds].filter((id) => newIds.has(id));
      for (const employeeId of toUpdate) {
        await tx.employeeExpense.update({
          where: { expenseId_employeeId: { expenseId, employeeId } },
          data: { employeeShare: individualShare, status: false },
        });
      }

      // Create new records
      const toCreate = [...newIds].filter((id) => !existingIds.has(id));
      for (const employeeId of toCreate) {
        await tx.employeeExpense.create({
          data: {
            expenseId,
            employeeId,
            employeeShare: individualShare,
            comment: data.comment || null,
            status: false,
          },
        });
      }

      // Update expense record
      const expense = await tx.expense.update({
        where: { id: expenseId },
        data: {
          name: data.name.trim(),
          expenditure: data.expenditure,
          categoryId: data.categoryId,
          date: data.date ? new Date(data.date) : undefined,
        },
      });

      return expense;
    });
  }

  /** FR-004: Delete Expense (CASCADE handles employee_expense cleanup) */
  async deleteExpense(expenseId: number) {
    return this.prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  /** FR-005: Get all expenses with category info */
  async getAllExpenses() {
    return this.prisma.expense.findMany({
      include: {
        category: { select: { name: true } },
        employees: {
          select: {
            employeeId: true,
            employeeShare: true,
            status: true,
            comment: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /** Get single expense by ID with full details */
  async getExpenseById(expenseId: number) {
    return this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        category: { select: { name: true } },
        employees: {
          select: {
            employeeId: true,
            employeeShare: true,
            status: true,
            comment: true,
            employee: { select: { name: true } },
          },
        },
      },
    });
  }
}
