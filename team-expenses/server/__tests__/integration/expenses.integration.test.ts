import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/index';

const prisma = new PrismaClient();

describe('Expenses API Integration', () => {
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
    await prisma.category.create({
      data: { id: 1, name: 'Food', description: 'Meals and snacks' },
    });
  });

  // TC-I-001: POST creates expense + employee_expense records
  it('TC-I-001: POST /api/expenses creates expense with splits', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        name: 'Team Lunch',
        expenditure: 3000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002', 'EMP003'],
        comment: 'Friday lunch',
      });

    expect(res.status).toBe(201);

    const splits = await prisma.employeeExpense.findMany({
      where: { expenseId: res.body.id },
    });
    expect(splits).toHaveLength(3);
    expect(Number(splits[0].employeeShare)).toBe(1000);
  });

  // TC-I-002: POST returns 400 for invalid input
  it('TC-I-002: POST /api/expenses returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        name: '',
        expenditure: 1000,
        categoryId: 1,
        employeeIds: ['EMP001'],
      });

    expect(res.status).toBe(400);
  });

  // TC-I-003: GET returns joined expense+category data
  it('TC-I-003: GET /api/expenses returns expenses with categories', async () => {
    await request(app)
      .post('/api/expenses')
      .send({
        name: 'Test Expense',
        expenditure: 1000,
        categoryId: 1,
        employeeIds: ['EMP001'],
      });

    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].categoryName).toBe('Food');
  });

  // TC-I-004: PUT updates expense and re-splits
  it('TC-I-004: PUT /api/expenses/:id updates and re-splits', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .send({
        name: 'Original',
        expenditure: 2000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002'],
      });

    const res = await request(app)
      .put(`/api/expenses/${createRes.body.id}`)
      .send({
        name: 'Updated',
        expenditure: 3000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002', 'EMP003'],
      });

    expect(res.status).toBe(200);
    const splits = await prisma.employeeExpense.findMany({
      where: { expenseId: createRes.body.id },
    });
    expect(splits).toHaveLength(3);
    expect(Number(splits[0].employeeShare)).toBe(1000);
  });

  // TC-I-005: PUT with changed employee list creates/deletes records
  it('TC-I-005: PUT removes deselected employees (bug fix)', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .send({
        name: 'Resplit Test',
        expenditure: 3000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002', 'EMP003'],
      });

    await request(app)
      .put(`/api/expenses/${createRes.body.id}`)
      .send({
        name: 'Resplit Test',
        expenditure: 2000,
        categoryId: 1,
        employeeIds: ['EMP001', 'EMP002'],
      });

    const splits = await prisma.employeeExpense.findMany({
      where: { expenseId: createRes.body.id },
    });
    expect(splits).toHaveLength(2);
    const employeeIds = splits.map((s) => s.employeeId);
    expect(employeeIds).not.toContain('EMP003');
  });

  // TC-I-006: DELETE removes expense and cascades
  it('TC-I-006: DELETE /api/expenses/:id cascades', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .send({
        name: 'To Delete',
        expenditure: 1000,
        categoryId: 1,
        employeeIds: ['EMP001'],
      });

    const res = await request(app).delete(`/api/expenses/${createRes.body.id}`);
    expect(res.status).toBe(204);

    const splits = await prisma.employeeExpense.findMany({
      where: { expenseId: createRes.body.id },
    });
    expect(splits).toHaveLength(0);
  });

  // TC-I-007: DELETE returns 404 for non-existent
  it('TC-I-007: DELETE returns 404 for non-existent expense', async () => {
    const res = await request(app).delete('/api/expenses/99999');
    expect(res.status).toBe(404);
  });
});
