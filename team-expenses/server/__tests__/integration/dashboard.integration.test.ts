import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/index';

const prisma = new PrismaClient();

describe('Dashboard API Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.employeeExpense.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
    await prisma.employee.deleteMany();

    await prisma.employee.createMany({
      data: [
        { id: 'EMP001', name: 'Haritha', isAdmin: true },
        { id: 'EMP002', name: 'Ravi', isAdmin: false },
        { id: 'EMP003', name: 'Priya', isAdmin: false },
      ],
    });
    await prisma.category.createMany({
      data: [
        { id: 1, name: 'Food', description: 'Meals' },
        { id: 2, name: 'Travel', description: 'Transport' },
      ],
    });

    // Create expenses with splits
    const exp1 = await prisma.expense.create({
      data: { name: 'Team Lunch', expenditure: 3000, categoryId: 1 },
    });
    await prisma.employeeExpense.createMany({
      data: [
        { expenseId: exp1.id, employeeId: 'EMP001', employeeShare: 1000, status: false },
        { expenseId: exp1.id, employeeId: 'EMP002', employeeShare: 1000, status: false },
        { expenseId: exp1.id, employeeId: 'EMP003', employeeShare: 1000, status: false },
      ],
    });

    const exp2 = await prisma.expense.create({
      data: { name: 'Cab', expenditure: 1500, categoryId: 2 },
    });
    await prisma.employeeExpense.createMany({
      data: [
        { expenseId: exp2.id, employeeId: 'EMP002', employeeShare: 750, status: false },
        { expenseId: exp2.id, employeeId: 'EMP003', employeeShare: 750, status: true },
      ],
    });
  });

  // TC-I-008: Summary returns correct values
  it('TC-I-008: GET /api/dashboard/summary returns correct totals', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.totalSpent).toBe(4500);
    expect(res.body.getsBack).toBe(3750); // 3000 + 750 (EMP003's cab is settled)
  });

  // TC-I-009: Employee shares grouped correctly
  it('TC-I-009: GET /api/dashboard/employee-shares returns grouped sums', async () => {
    const res = await request(app).get('/api/dashboard/employee-shares');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const ravi = res.body.find((s: any) => s.employeeId === 'EMP002');
    expect(ravi.totalShare).toBe(1750); // 1000 + 750
  });

  // TC-I-010: Per-category totals
  it('TC-I-010: GET /api/dashboard/by-category returns category totals', async () => {
    const res = await request(app).get('/api/dashboard/by-category');
    expect(res.status).toBe(200);
    const food = res.body.find((c: any) => c.categoryName === 'Food');
    const travel = res.body.find((c: any) => c.categoryName === 'Travel');
    expect(food.totalExpense).toBe(3000);
    expect(travel.totalExpense).toBe(1500);
  });

  // TC-I-011: After settling, getsBack decreases
  it('TC-I-011: getsBack decreases after settling', async () => {
    const beforeRes = await request(app).get('/api/dashboard/summary');
    const beforeGetsBack = beforeRes.body.getsBack;

    // Settle EMP001's share of Team Lunch
    const shares = await prisma.employeeExpense.findMany({
      where: { employeeId: 'EMP001', status: false },
    });
    if (shares.length > 0) {
      await request(app).post('/api/settle').send({
        expenseId: shares[0].expenseId,
        employeeId: 'EMP001',
      });
    }

    const afterRes = await request(app).get('/api/dashboard/summary');
    expect(afterRes.body.getsBack).toBeLessThan(beforeGetsBack);
  });
});
