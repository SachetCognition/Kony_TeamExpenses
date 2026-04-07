import { PrismaClient } from '@prisma/client';

export class SettleService {
  constructor(private prisma: PrismaClient) {}

  /** FR-002: Settle Up - mark employee_expense as paid */
  async settleUp(expenseId: number, employeeId: string) {
    const record = await this.prisma.employeeExpense.findUnique({
      where: { expenseId_employeeId: { expenseId, employeeId } },
    });

    if (!record) {
      throw new Error('Employee expense record not found');
    }

    return this.prisma.employeeExpense.update({
      where: { expenseId_employeeId: { expenseId, employeeId } },
      data: { status: true },
    });
  }

  /** FR-009: Get unsettled expenses for an employee */
  async getUnsettledExpenses(employeeId: string) {
    return this.prisma.employeeExpense.findMany({
      where: {
        employeeId,
        status: false,
      },
      include: {
        expense: {
          select: { id: true, name: true, expenditure: true },
        },
      },
    });
  }
}
