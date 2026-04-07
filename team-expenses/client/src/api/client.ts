const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Expense types
export interface Expense {
  id: number;
  name: string;
  expenditure: number;
  categoryId: number;
  categoryName: string;
  date: string;
  employees: EmployeeExpenseEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDetail extends Expense {
  employees: EmployeeExpenseDetail[];
}

export interface EmployeeExpenseEntry {
  employeeId: string;
  employeeShare: number;
  status: boolean;
  comment: string | null;
}

export interface EmployeeExpenseDetail extends EmployeeExpenseEntry {
  employeeName: string;
}

export interface CreateExpenseData {
  name: string;
  expenditure: number;
  categoryId: number;
  employeeIds: string[];
  comment?: string;
  date?: string;
}

// Dashboard types
export interface DashboardSummary {
  totalSpent: number;
  getsBack: number;
}

export interface EmployeeShare {
  employeeId: string;
  name: string;
  totalShare: number;
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  totalExpense: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Employee types
export interface Employee {
  id: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Unsettled expense
export interface UnsettledExpense {
  expenseId: number;
  expenseName: string;
  employeeShare: number;
  comment: string | null;
}

// API functions
export const api = {
  // Expenses
  getExpenses: () => request<Expense[]>('/expenses'),
  getExpense: (id: number) => request<ExpenseDetail>(`/expenses/${id}`),
  createExpense: (data: CreateExpenseData) =>
    request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: number, data: CreateExpenseData) =>
    request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: number) =>
    request<void>(`/expenses/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),
  getEmployeeShares: () => request<EmployeeShare[]>('/dashboard/employee-shares'),
  getCategoryExpenses: () => request<CategoryExpense[]>('/dashboard/by-category'),

  // Settle
  settleUp: (expenseId: number, employeeId: string) =>
    request<void>('/settle', { method: 'POST', body: JSON.stringify({ expenseId, employeeId }) }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: { name: string; description?: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Employees
  getEmployees: (search?: string) =>
    request<Employee[]>(`/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUnsettledExpenses: (employeeId: string) =>
    request<UnsettledExpense[]>(`/employees/${employeeId}/unsettled`),
  createEmployee: (data: { id: string; name: string; isAdmin: boolean }) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
};
