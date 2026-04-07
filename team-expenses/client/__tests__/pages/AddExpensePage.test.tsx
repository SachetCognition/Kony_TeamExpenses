import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AddExpensePage from '../../src/pages/AddExpensePage';

vi.mock('../../src/api/hooks', () => ({
  useCategories: vi.fn(() => ({
    data: [
      { id: 1, name: 'Food', description: 'Meals and snacks' },
      { id: 2, name: 'Travel', description: 'Transportation' },
    ],
    isLoading: false,
  })),
  useEmployees: vi.fn(() => ({
    data: [
      { id: 'EMP001', name: 'Haritha', isAdmin: true },
      { id: 'EMP002', name: 'Ravi', isAdmin: false },
      { id: 'EMP003', name: 'Priya', isAdmin: false },
    ],
    isLoading: false,
  })),
  useCreateExpense: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
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

describe('AddExpensePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-F-003: Validates required fields
  it('TC-F-003: validates required fields before submit', async () => {
    renderWithProviders(<AddExpensePage />);
    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);
    // Should show validation errors for empty fields
    expect(screen.getByTestId('error-message')).toHaveTextContent(/required/i);
  });

  // TC-F-004: Select All / Clear All toggles
  it('TC-F-004: Select All and Clear All toggles work', () => {
    renderWithProviders(<AddExpensePage />);

    // Click Select All
    const selectAllBtn = screen.getByTestId('select-all-btn');
    fireEvent.click(selectAllBtn);

    // All employee checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });

    // Click Clear All
    const clearAllBtn = screen.getByTestId('clear-all-btn');
    fireEvent.click(clearAllBtn);

    // All checkboxes should be unchecked
    checkboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });
});
