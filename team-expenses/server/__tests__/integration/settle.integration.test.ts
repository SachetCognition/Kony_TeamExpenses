import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/index';

const prisma = new PrismaClient();

describe('Settle API Integration', () => {
  let expenseId: number;

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
      ],
    });
    await prisma.category.create({
      data: { id: 1, name: 'Food', description: 'Meals' },
    });

    const expense = await prisma.expense.create({
      data: { name: 'Test Expense', expenditure: 2000, categoryId: 1 },
    });
    expenseId = expense.id;

    await prisma.employeeExpense.createMany({
      data: [
        { expenseId, employeeId: 'EMP001', employeeShare: 1000, status: false },
        { expenseId, employeeId: 'EMP002', employeeShare: 1000, status: false },
      ],
    });
  });

  // TC-I-012: POST /api/settle marks record as settled
  it('TC-I-012: settles an expense for an employee', async () => {
    const res = await request(app)
      .post('/api/settle')
      .send({ expenseId, employeeId: 'EMP001' });

    expect(res.status).toBe(200);

    const record = await prisma.employeeExpense.findUnique({
      where: { expenseId_employeeId: { expenseId, employeeId: 'EMP001' } },
    });
    expect(record?.status).toBe(true);
  });

  // TC-I-013: POST /api/settle for already-settled record is idempotent
  it('TC-I-013: settling already-settled record is idempotent', async () => {
    await request(app)
      .post('/api/settle')
      .send({ expenseId, employeeId: 'EMP001' });

    const res = await request(app)
      .post('/api/settle')
      .send({ expenseId, employeeId: 'EMP001' });

    expect(res.status).toBe(200);
  });

  // TC-I-014: GET unsettled expenses
  it('TC-I-014: GET /api/employees/:id/unsettled returns unpaid only', async () => {
    // Settle one
    await request(app)
      .post('/api/settle')
      .send({ expenseId, employeeId: 'EMP001' });

    const res = await request(app).get('/api/employees/EMP002/unsettled');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].employeeId).toBe('EMP002');

    const res2 = await request(app).get('/api/employees/EMP001/unsettled');
    expect(res2.body.length).toBe(0);
  });
});
