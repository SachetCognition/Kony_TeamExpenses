import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';

// Mock the hooks
vi.mock('../../src/api/hooks', () => ({
  useExpenses: vi.fn(() => ({
    data: [
      { id: 1, name: 'Team Lunch', expenditure: 3000, categoryName: 'Food', date: '2024-01-15' },
      { id: 2, name: 'Cab to Airport', expenditure: 1500, categoryName: 'Travel', date: '2024-01-20' },
    ],
    isLoading: false,
  })),
  useDashboardSummary: vi.fn(() => ({
    data: { totalSpent: 4500, getsBack: 3750 },
  })),
  useEmployeeShares: vi.fn(() => ({
    data: [
      { employeeId: 'EMP002', name: 'Ravi', totalShare: 1750 },
      { employeeId: 'EMP003', name: 'Priya', totalShare: 1750 },
    ],
  })),
  useCategoryExpenses: vi.fn(() => ({
    data: [
      { categoryId: 1, categoryName: 'Food', totalExpense: 3000 },
      { categoryId: 2, categoryName: 'Travel', totalExpense: 1500 },
    ],
  })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-F-001: Renders expense list and employee shares
  it('TC-F-001: renders expense list and employee shares', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Team Lunch')).toBeInTheDocument();
    expect(screen.getByText('Cab to Airport')).toBeInTheDocument();
    expect(screen.getByText('Ravi')).toBeInTheDocument();
    expect(screen.getByText('Priya')).toBeInTheDocument();
  });

  // TC-F-002: Shows correct totals
  it('TC-F-002: shows correct Amount Spent and Gets back', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByTestId('total-spent')).toHaveTextContent('₹4500.00');
    expect(screen.getByTestId('gets-back')).toHaveTextContent('₹3750.00');
  });

  // TC-F-007: Search filters employees by substring
  it('TC-F-007: search filters employees by name', () => {
    renderWithProviders(<DashboardPage />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Ravi' } });
    expect(screen.getByText('Ravi')).toBeInTheDocument();
    expect(screen.queryByText('Priya')).not.toBeInTheDocument();
  });

  // TC-F-008: Clear search restores full list
  it('TC-F-008: clear search restores full list', () => {
    renderWithProviders(<DashboardPage />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Ravi' } });
    expect(screen.queryByText('Priya')).not.toBeInTheDocument();

    const clearBtn = screen.getByTestId('clear-search-btn');
    fireEvent.click(clearBtn);
    expect(screen.getByText('Priya')).toBeInTheDocument();
    expect(screen.getByText('Ravi')).toBeInTheDocument();
  });

  // TC-F-009: Navigation from expense row to edit page
  it('TC-F-009: clicking expense row navigates to edit page', () => {
    renderWithProviders(<DashboardPage />);
    const row = screen.getByTestId('expense-row-1');
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/edit-expense/1');
  });

  // TC-F-010: Navigation from Settle Up button
  it('TC-F-010: clicking Settle Up navigates to settle-up page', () => {
    renderWithProviders(<DashboardPage />);
    const settleBtn = screen.getByTestId('settle-btn-EMP002');
    fireEvent.click(settleBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/settle-up/EMP002');
  });
});
