import { PrismaClient } from '@prisma/client';

export class EmployeeService {
  constructor(private prisma: PrismaClient) {}

  /** FR-016: Get all employees */
  async getAllEmployees() {
    return this.prisma.employee.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** FR-011: Search employees by name (case-insensitive substring) */
  async searchEmployees(query: string) {
    return this.prisma.employee.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  }

  /** FR-016: Create employee */
  async createEmployee(data: { id: string; name: string; isAdmin: boolean }) {
    return this.prisma.employee.create({
      data: {
        id: data.id,
        name: data.name,
        isAdmin: data.isAdmin,
      },
    });
  }

  /** FR-016: Update employee */
  async updateEmployee(id: string, data: { name?: string; isAdmin?: boolean }) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  /** FR-016: Delete employee */
  async deleteEmployee(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
