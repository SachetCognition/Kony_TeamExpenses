import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.employeeExpense.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.employee.deleteMany();

  // Employees
  const employees = await Promise.all([
    prisma.employee.create({ data: { id: 'EMP001', name: 'Haritha', isAdmin: true } }),
    prisma.employee.create({ data: { id: 'EMP002', name: 'Ravi', isAdmin: false } }),
    prisma.employee.create({ data: { id: 'EMP003', name: 'Priya', isAdmin: false } }),
    prisma.employee.create({ data: { id: 'EMP004', name: 'Amit', isAdmin: false } }),
    prisma.employee.create({ data: { id: 'EMP005', name: 'Sneha', isAdmin: false } }),
  ]);

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { id: 1, name: 'Food', description: 'Meals and snacks' } }),
    prisma.category.create({ data: { id: 2, name: 'Travel', description: 'Transportation expenses' } }),
    prisma.category.create({ data: { id: 3, name: 'Office Supplies', description: 'Stationery and equipment' } }),
    prisma.category.create({ data: { id: 4, name: 'Entertainment', description: 'Team outings and events' } }),
  ]);

  // Expense 1: Team Lunch - split among EMP002, EMP003, EMP004 (1000 each, all unpaid)
  const expense1 = await prisma.expense.create({
    data: {
      name: 'Team Lunch',
      expenditure: new Prisma.Decimal(3000),
      categoryId: 1,
      date: new Date('2024-01-15'),
    },
  });
  await Promise.all([
    prisma.employeeExpense.create({ data: { expenseId: expense1.id, employeeId: 'EMP002', employeeShare: new Prisma.Decimal(1000), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense1.id, employeeId: 'EMP003', employeeShare: new Prisma.Decimal(1000), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense1.id, employeeId: 'EMP004', employeeShare: new Prisma.Decimal(1000), status: false } }),
  ]);

  // Expense 2: Cab to Airport - split among EMP002, EMP003 (750 each, all unpaid)
  const expense2 = await prisma.expense.create({
    data: {
      name: 'Cab to Airport',
      expenditure: new Prisma.Decimal(1500),
      categoryId: 2,
      date: new Date('2024-01-20'),
    },
  });
  await Promise.all([
    prisma.employeeExpense.create({ data: { expenseId: expense2.id, employeeId: 'EMP002', employeeShare: new Prisma.Decimal(750), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense2.id, employeeId: 'EMP003', employeeShare: new Prisma.Decimal(750), status: false } }),
  ]);

  // Expense 3: Printer Paper - split among EMP004, EMP005 (250 each, EMP004 settled, EMP005 unpaid)
  const expense3 = await prisma.expense.create({
    data: {
      name: 'Printer Paper',
      expenditure: new Prisma.Decimal(500),
      categoryId: 3,
      date: new Date('2024-02-01'),
    },
  });
  await Promise.all([
    prisma.employeeExpense.create({ data: { expenseId: expense3.id, employeeId: 'EMP004', employeeShare: new Prisma.Decimal(250), status: true } }),
    prisma.employeeExpense.create({ data: { expenseId: expense3.id, employeeId: 'EMP005', employeeShare: new Prisma.Decimal(250), status: false } }),
  ]);

  // Expense 4: Movie Night - split among EMP002, EMP003, EMP004, EMP005 (500 each, all unpaid)
  const expense4 = await prisma.expense.create({
    data: {
      name: 'Movie Night',
      expenditure: new Prisma.Decimal(2000),
      categoryId: 4,
      date: new Date('2024-02-10'),
    },
  });
  await Promise.all([
    prisma.employeeExpense.create({ data: { expenseId: expense4.id, employeeId: 'EMP002', employeeShare: new Prisma.Decimal(500), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense4.id, employeeId: 'EMP003', employeeShare: new Prisma.Decimal(500), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense4.id, employeeId: 'EMP004', employeeShare: new Prisma.Decimal(500), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense4.id, employeeId: 'EMP005', employeeShare: new Prisma.Decimal(500), status: false } }),
  ]);

  // Expense 5: Office Snacks - split among EMP003, EMP005 (400 each, all unpaid)
  const expense5 = await prisma.expense.create({
    data: {
      name: 'Office Snacks',
      expenditure: new Prisma.Decimal(800),
      categoryId: 1,
      date: new Date('2024-02-15'),
    },
  });
  await Promise.all([
    prisma.employeeExpense.create({ data: { expenseId: expense5.id, employeeId: 'EMP003', employeeShare: new Prisma.Decimal(400), status: false } }),
    prisma.employeeExpense.create({ data: { expenseId: expense5.id, employeeId: 'EMP005', employeeShare: new Prisma.Decimal(400), status: false } }),
  ]);

  console.log('Seed data created successfully!');
  console.log(`  Employees: ${employees.length}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Expenses: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
