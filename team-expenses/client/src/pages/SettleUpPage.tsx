import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnsettledExpenses, useSettleUp, useEmployees } from '../api/hooks';

export default function SettleUpPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const { data: employees = [] } = useEmployees();
  const { data: unsettled = [] } = useUnsettledExpenses(employeeId || '');
  const settleUp = useSettleUp();

  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const employee = employees.find((e) => e.id === employeeId);

  useEffect(() => {
    if (unsettled.length > 0 && selectedExpenseId === null) {
      setSelectedExpenseId(unsettled[0].expenseId);
    }
  }, [unsettled, selectedExpenseId]);

  const selectedExpense = unsettled.find((u) => u.expenseId === selectedExpenseId);
  const totalShare = unsettled.reduce((sum, u) => sum + u.employeeShare, 0);

  const handleSettle = async () => {
    if (!selectedExpenseId || !employeeId) return;
    setError('');
    try {
      await settleUp.mutateAsync({ expenseId: selectedExpenseId, employeeId });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to settle');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settle Up</h1>

      {error && (
        <div data-testid="error-message" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <input
            data-testid="settle-employee"
            type="text"
            value={employee?.name || employeeId || ''}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Outstanding</label>
          <input
            data-testid="settle-total"
            type="text"
            value={`₹${totalShare.toFixed(2)}`}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Expense</label>
          <select
            data-testid="settle-expense-select"
            value={selectedExpenseId ?? ''}
            onChange={(e) => setSelectedExpenseId(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          >
            {unsettled.map((u) => (
              <option key={u.expenseId} value={u.expenseId}>
                {u.expenseName} - ₹{u.employeeShare.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            data-testid="settle-amount"
            type="text"
            value={selectedExpense ? `₹${selectedExpense.employeeShare.toFixed(2)}` : '₹0.00'}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            data-testid="settle-btn"
            onClick={handleSettle}
            disabled={settleUp.isPending || !selectedExpenseId}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {settleUp.isPending ? 'Settling...' : 'Settle Up'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
