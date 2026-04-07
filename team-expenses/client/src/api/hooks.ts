import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateExpenseData } from './client';

// Expense hooks
export function useExpenses() {
  return useQuery({ queryKey: ['expenses'], queryFn: api.getExpenses });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => api.getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => api.createExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExpense(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => api.updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Dashboard hooks
export function useDashboardSummary() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: api.getDashboardSummary });
}

export function useEmployeeShares() {
  return useQuery({ queryKey: ['dashboard', 'employee-shares'], queryFn: api.getEmployeeShares });
}

export function useCategoryExpenses() {
  return useQuery({ queryKey: ['dashboard', 'by-category'], queryFn: api.getCategoryExpenses });
}

// Settle hooks
export function useSettleUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, employeeId }: { expenseId: number; employeeId: string }) =>
      api.settleUp(expenseId, employeeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['unsettled'] });
    },
  });
}

// Category hooks
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Employee hooks
export function useEmployees(search?: string) {
  return useQuery({
    queryKey: ['employees', search],
    queryFn: () => api.getEmployees(search),
  });
}

export function useUnsettledExpenses(employeeId: string) {
  return useQuery({
    queryKey: ['unsettled', employeeId],
    queryFn: () => api.getUnsettledExpenses(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string; isAdmin: boolean }) => api.createEmployee(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
