import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '../../src/services/dashboardService';

const mockPrisma = {
  expense: {
    aggregate: vi.fn(),
  },
  employeeExpense: {
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  employee: {
    findMany: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
} as any;

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPrisma);
  });

  describe('getTotalSpent', () => {
    // TC-U-013: sums all expense expenditures correctly
    it('TC-U-013: sums all expense expenditures correctly', async () => {
      mockPrisma.expense.aggregate.mockResolvedValue({
        _sum: { expenditure: 7800 },
      });

      const result = await service.getTotalSpent();
      expect(result).toBe(7800);
    });
  });

  describe('getGetsBack', () => {
    // TC-U-014: sums only unpaid employee shares
    it('TC-U-014: sums only unpaid employee shares', async () => {
      mockPrisma.employeeExpense.aggregate.mockResolvedValue({
        _sum: { employeeShare: 6550 },
      });

      const result = await service.getGetsBack();
      expect(result).toBe(6550);
      expect(mockPrisma.employeeExpense.aggregate).toHaveBeenCalledWith({
        where: { status: false },
        _sum: { employeeShare: true },
      });
    });
  });

  describe('getEmployeeShares', () => {
    // TC-U-015: groups by employee correctly
    it('TC-U-015: groups by employee correctly', async () => {
      mockPrisma.employeeExpense.groupBy.mockResolvedValue([
        { employeeId: 'EMP002', _sum: { employeeShare: 2250 } },
        { employeeId: 'EMP003', _sum: { employeeShare: 2150 } },
      ]);
      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 'EMP002', name: 'Ravi' },
        { id: 'EMP003', name: 'Priya' },
      ]);

      const result = await service.getEmployeeShares();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        employeeId: 'EMP002',
        name: 'Ravi',
        totalShare: 2250,
      });
    });

    // TC-U-016: excludes settled records
    it('TC-U-016: excludes settled records', async () => {
      mockPrisma.employeeExpense.groupBy.mockResolvedValue([]);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await service.getEmployeeShares();

      expect(mockPrisma.employeeExpense.groupBy).toHaveBeenCalledWith({
        by: ['employeeId'],
        where: { status: false },
        _sum: { employeeShare: true },
      });
    });
  });

  describe('getExpensesByCategory', () => {
    // TC-U-017: sums per category correctly
    it('TC-U-017: sums per category correctly', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: 1, name: 'Food', expenses: [{ expenditure: 3000 }, { expenditure: 800 }] },
        { id: 2, name: 'Travel', expenses: [{ expenditure: 1500 }] },
      ]);

      const result = await service.getExpensesByCategory();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ categoryId: 1, categoryName: 'Food', totalExpense: 3800 });
      expect(result[1]).toEqual({ categoryId: 2, categoryName: 'Travel', totalExpense: 1500 });
    });

    // TC-U-018: includes categories with zero expenses
    it('TC-U-018: includes categories with zero expenses', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: 1, name: 'Food', expenses: [] },
        { id: 2, name: 'Travel', expenses: [] },
      ]);

      const result = await service.getExpensesByCategory();
      expect(result[0].totalExpense).toBe(0);
      expect(result[1].totalExpense).toBe(0);
    });
  });
});
