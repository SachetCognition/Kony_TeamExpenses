import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from '../../src/services/employeeService';

const mockPrisma = {
  employee: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as any;

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService(mockPrisma);
  });

  // TC-U-023: createEmployee with isAdmin=true when selectedKey===0
  it('TC-U-023: creates employee with isAdmin=true', async () => {
    const mockEmp = { id: 'EMP001', name: 'Haritha', isAdmin: true };
    mockPrisma.employee.create.mockResolvedValue(mockEmp);

    const result = await service.createEmployee({ id: 'EMP001', name: 'Haritha', isAdmin: true });
    expect(result.isAdmin).toBe(true);
  });

  // TC-U-024: createEmployee with isAdmin=false otherwise
  it('TC-U-024: creates employee with isAdmin=false', async () => {
    const mockEmp = { id: 'EMP002', name: 'Ravi', isAdmin: false };
    mockPrisma.employee.create.mockResolvedValue(mockEmp);

    const result = await service.createEmployee({ id: 'EMP002', name: 'Ravi', isAdmin: false });
    expect(result.isAdmin).toBe(false);
  });

  // TC-U-025: searchEmployees case-insensitive substring match
  it('TC-U-025: searches employees case-insensitively', async () => {
    const employees = [{ id: 'EMP003', name: 'Priya' }];
    mockPrisma.employee.findMany.mockResolvedValue(employees);

    const result = await service.searchEmployees('pri');
    expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'pri', mode: 'insensitive' } },
      orderBy: { name: 'asc' },
    });
    expect(result).toHaveLength(1);
  });

  // TC-U-026: searchEmployees returns empty for no match
  it('TC-U-026: returns empty for no match', async () => {
    mockPrisma.employee.findMany.mockResolvedValue([]);

    const result = await service.searchEmployees('xyz');
    expect(result).toHaveLength(0);
  });
});
