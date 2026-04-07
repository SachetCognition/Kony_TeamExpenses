import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditExpensePage from '../../src/pages/EditExpensePage';

// Stable references to prevent infinite re-render loops in useEffect
const expenseData = {
  id: 1,
  name: 'Team Lunch',
  expenditure: 3000,
  categoryId: 1,
  date: '2024-01-15',
  employees: [
    { employeeId: 'EMP002', name: 'Ravi', employeeShare: 1000, status: false },
    { employeeId: 'EMP003', name: 'Priya', employeeShare: 1000, status: false },
    { employeeId: 'EMP004', name: 'Amit', employeeShare: 1000, status: false },
  ],
};
const categoriesData = [
  { id: 1, name: 'Food', description: 'Meals and snacks' },
  { id: 2, name: 'Travel', description: 'Transportation' },
];
const employeesData = [
  { id: 'EMP001', name: 'Haritha', isAdmin: true },
  { id: 'EMP002', name: 'Ravi', isAdmin: false },
  { id: 'EMP003', name: 'Priya', isAdmin: false },
  { id: 'EMP004', name: 'Amit', isAdmin: false },
  { id: 'EMP005', name: 'Sneha', isAdmin: false },
];
const mutateFn = vi.fn();

vi.mock('../../src/api/hooks', () => ({
  useExpense: () => ({ data: expenseData, isLoading: false }),
  useCategories: () => ({ data: categoriesData, isLoading: false }),
  useEmployees: () => ({ data: employeesData, isLoading: false }),
  useUpdateExpense: () => ({ mutateAsync: mutateFn, isPending: false }),
  useDeleteExpense: () => ({ mutateAsync: mutateFn, isPending: false }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithProviders(ui: React.ReactElement, initialRoute = '/edit-expense/1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/edit-expense/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('EditExpensePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-F-005: Pre-populates form fields
  it('TC-F-005: pre-populates form fields from expense data', async () => {
    renderWithProviders(<EditExpensePage />);

    await waitFor(() => {
      const nameInput = screen.getByTestId('expense-name') as HTMLInputElement;
      expect(nameInput.value).toBe('Team Lunch');
    });

    const amountInput = screen.getByTestId('expense-amount') as HTMLInputElement;
    expect(amountInput.value).toBe('3000');

    // Check that existing employees are selected
    const emp002Checkbox = screen.getByTestId('emp-checkbox-EMP002') as HTMLInputElement;
    const emp003Checkbox = screen.getByTestId('emp-checkbox-EMP003') as HTMLInputElement;
    const emp004Checkbox = screen.getByTestId('emp-checkbox-EMP004') as HTMLInputElement;
    expect(emp002Checkbox.checked).toBe(true);
    expect(emp003Checkbox.checked).toBe(true);
    expect(emp004Checkbox.checked).toBe(true);

    // EMP001 and EMP005 should NOT be selected
    const emp001Checkbox = screen.getByTestId('emp-checkbox-EMP001') as HTMLInputElement;
    const emp005Checkbox = screen.getByTestId('emp-checkbox-EMP005') as HTMLInputElement;
    expect(emp001Checkbox.checked).toBe(false);
    expect(emp005Checkbox.checked).toBe(false);
  });
});
