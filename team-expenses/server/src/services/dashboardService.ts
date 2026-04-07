import { PrismaClient } from '@prisma/client';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  /** FR-006: Total Amount Spent - sum of all expense expenditures */
  async getTotalSpent(): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      _sum: { expenditure: true },
    });
    return Number(result._sum.expenditure || 0);
  }

  /** FR-007: Gets Back - sum of unpaid employee shares */
  async getGetsBack(): Promise<number> {
    const result = await this.prisma.employeeExpense.aggregate({
      where: { status: false },
      _sum: { employeeShare: true },
    });
    return Number(result._sum.employeeShare || 0);
  }

  /** FR-007: Employee Shares - grouped by employee, only unpaid */
  async getEmployeeShares() {
    const shares = await this.prisma.employeeExpense.groupBy({
      by: ['employeeId'],
      where: { status: false },
      _sum: { employeeShare: true },
    });

    const employeeIds = shares.map((s) => s.employeeId);
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true },
    });

    const employeeMap = new Map(employees.map((e) => [e.id, e.name]));

    return shares.map((s) => ({
      employeeId: s.employeeId,
      name: employeeMap.get(s.employeeId) || s.employeeId,
      totalShare: Number(s._sum.employeeShare || 0),
    }));
  }

  /** FR-008: Per-Category Expense Totals */
  async getExpensesByCategory() {
    const categories = await this.prisma.category.findMany({
      include: {
        expenses: {
          select: { expenditure: true },
        },
      },
    });

    return categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      totalExpense: cat.expenses.reduce(
        (sum, exp) => sum + Number(exp.expenditure),
        0
      ),
    }));
  }

  /** Combined dashboard summary */
  async getSummary() {
    const [totalSpent, getsBack] = await Promise.all([
      this.getTotalSpent(),
      this.getGetsBack(),
    ]);
    return { totalSpent, getsBack };
  }
}
