import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/index';

const prisma = new PrismaClient();

describe('CRUD API Integration', () => {
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
  });

  // TC-I-015: Full CRUD lifecycle for categories
  describe('Categories CRUD', () => {
    it('TC-I-015: full category lifecycle', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/categories')
        .send({ name: 'Food', description: 'Meals and snacks' });
      expect(createRes.status).toBe(201);
      const catId = createRes.body.id;

      // Read
      const listRes = await request(app).get('/api/categories');
      expect(listRes.body.length).toBe(1);
      expect(listRes.body[0].name).toBe('Food');

      // Update
      const updateRes = await request(app)
        .put(`/api/categories/${catId}`)
        .send({ name: 'Food & Drinks', description: 'Updated' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.name).toBe('Food & Drinks');

      // Delete
      const deleteRes = await request(app).delete(`/api/categories/${catId}`);
      expect(deleteRes.status).toBe(204);

      const afterDelete = await request(app).get('/api/categories');
      expect(afterDelete.body.length).toBe(0);
    });
  });

  // TC-I-016: Full CRUD lifecycle for employees
  describe('Employees CRUD', () => {
    it('TC-I-016: full employee lifecycle', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/employees')
        .send({ id: 'EMP001', name: 'Haritha', isAdmin: true });
      expect(createRes.status).toBe(201);

      // Read
      const listRes = await request(app).get('/api/employees');
      expect(listRes.body.length).toBe(1);
      expect(listRes.body[0].name).toBe('Haritha');

      // Update
      const updateRes = await request(app)
        .put('/api/employees/EMP001')
        .send({ name: 'Haritha S', isAdmin: false });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.name).toBe('Haritha S');

      // Delete
      const deleteRes = await request(app).delete('/api/employees/EMP001');
      expect(deleteRes.status).toBe(204);

      const afterDelete = await request(app).get('/api/employees');
      expect(afterDelete.body.length).toBe(0);
    });
  });

  // TC-I-017: Employee search with partial name match
  describe('Employee Search', () => {
    it('TC-I-017: searches employees by partial name', async () => {
      await prisma.employee.createMany({
        data: [
          { id: 'EMP001', name: 'Haritha', isAdmin: true },
          { id: 'EMP002', name: 'Ravi', isAdmin: false },
          { id: 'EMP003', name: 'Priya', isAdmin: false },
        ],
      });

      const res = await request(app).get('/api/employees?search=ri');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2); // Haritha, Priya both contain 'ri'

      const res2 = await request(app).get('/api/employees?search=Ravi');
      expect(res2.body.length).toBe(1);

      const res3 = await request(app).get('/api/employees?search=xyz');
      expect(res3.body.length).toBe(0);
    });
  });
});
