import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettleService } from '../../src/services/settleService';

const mockPrisma = {
  employeeExpense: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
} as any;

describe('SettleService', () => {
  let service: SettleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SettleService(mockPrisma);
  });

  describe('settleUp', () => {
    // TC-U-009: sets status=true for correct composite key
    it('TC-U-009: sets status=true for correct composite key', async () => {
      mockPrisma.employeeExpense.findUnique.mockResolvedValue({
        expenseId: 1,
        employeeId: 'EMP001',
        status: false,
      });
      mockPrisma.employeeExpense.update.mockResolvedValue({
        expenseId: 1,
        employeeId: 'EMP001',
        status: true,
      });

      const result = await service.settleUp(1, 'EMP001');

      expect(mockPrisma.employeeExpense.update).toHaveBeenCalledWith({
        where: { expenseId_employeeId: { expenseId: 1, employeeId: 'EMP001' } },
        data: { status: true },
      });
      expect(result.status).toBe(true);
    });

    // TC-U-010: returns error for non-existent record
    it('TC-U-010: returns error for non-existent record', async () => {
      mockPrisma.employeeExpense.findUnique.mockResolvedValue(null);

      await expect(service.settleUp(999, 'NONEXIST')).rejects.toThrow(
        'Employee expense record not found'
      );
    });
  });

  describe('getUnsettledExpenses', () => {
    // TC-U-011: returns only status=false records
    it('TC-U-011: returns only status=false records', async () => {
      const unsettled = [
        { expenseId: 1, employeeId: 'EMP001', status: false, expense: { name: 'Lunch' } },
        { expenseId: 2, employeeId: 'EMP001', status: false, expense: { name: 'Cab' } },
      ];
      mockPrisma.employeeExpense.findMany.mockResolvedValue(unsettled);

      const result = await service.getUnsettledExpenses('EMP001');

      expect(mockPrisma.employeeExpense.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'EMP001', status: false },
        include: { expense: { select: { id: true, name: true, expenditure: true } } },
      });
      expect(result).toHaveLength(2);
    });

    // TC-U-012: returns empty array when all settled
    it('TC-U-012: returns empty array when all settled', async () => {
      mockPrisma.employeeExpense.findMany.mockResolvedValue([]);

      const result = await service.getUnsettledExpenses('EMP001');

      expect(result).toHaveLength(0);
    });
  });
});
