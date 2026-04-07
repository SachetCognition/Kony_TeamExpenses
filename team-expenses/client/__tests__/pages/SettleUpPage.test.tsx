import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SettleUpPage from '../../src/pages/SettleUpPage';

vi.mock('../../src/api/hooks', () => ({
  useEmployees: vi.fn(() => ({
    data: [
      { id: 'EMP001', name: 'Haritha', isAdmin: true },
      { id: 'EMP002', name: 'Ravi', isAdmin: false },
      { id: 'EMP003', name: 'Priya', isAdmin: false },
    ],
    isLoading: false,
  })),
  useUnsettledExpenses: vi.fn(() => ({
    data: [
      { expenseId: 1, expenseName: 'Team Lunch', employeeShare: 1000 },
      { expenseId: 2, expenseName: 'Cab to Airport', employeeShare: 750 },
    ],
    isLoading: false,
  })),
  useSettleUp: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithProviders(ui: React.ReactElement, initialRoute = '/settle-up/EMP002') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/settle-up/:employeeId" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SettleUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-F-006: Updates amount when expense dropdown changes
  it('TC-F-006: updates amount when expense dropdown changes', () => {
    renderWithProviders(<SettleUpPage />);

    // Employee name should be shown
    const empField = screen.getByTestId('settle-employee') as HTMLInputElement;
    expect(empField.value).toContain('Ravi');

    // Default amount should show first expense share
    const amountField = screen.getByTestId('settle-amount') as HTMLInputElement;
    expect(amountField.value).toContain('1000');

    // Change expense selection
    const expenseSelect = screen.getByTestId('settle-expense-select');
    fireEvent.change(expenseSelect, { target: { value: '2' } });

    // Amount should update to second expense's share
    const updatedAmount = screen.getByTestId('settle-amount') as HTMLInputElement;
    expect(updatedAmount.value).toContain('750');
  });
});
