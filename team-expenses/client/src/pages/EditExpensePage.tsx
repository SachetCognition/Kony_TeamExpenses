import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useExpense,
  useCategories,
  useEmployees,
  useUpdateExpense,
  useDeleteExpense,
} from '../api/hooks';

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const expenseId = Number(id);

  const { data: expense, isLoading } = useExpense(expenseId);
  const { data: categories = [] } = useCategories();
  const { data: employees = [] } = useEmployees();
  const updateExpense = useUpdateExpense(expenseId);
  const deleteExpense = useDeleteExpense();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(String(expense.expenditure));
      setCategoryId(String(expense.categoryId));
      setSelectedEmployees(expense.employees.map((e) => e.employeeId));
      setComment(expense.employees[0]?.comment || '');
      setDate(expense.date);
    }
  }, [expense]);

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((e) => e !== empId) : [...prev, empId]
    );
  };

  const handleUpdate = async () => {
    setError('');
    if (!name.trim()) {
      setError('Expense name is required');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (selectedEmployees.length === 0) {
      setError('Select at least one employee');
      return;
    }
    try {
      await updateExpense.mutateAsync({
        name: name.trim(),
        expenditure: Number(amount),
        categoryId: Number(categoryId),
        employeeIds: selectedEmployees,
        comment: comment || undefined,
        date,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense.mutateAsync(expenseId);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto p-6">Loading...</div>;
  }

  const individualShare =
    selectedEmployees.length > 0 && Number(amount) > 0
      ? (Number(amount) / selectedEmployees.length).toFixed(2)
      : '0.00';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Expense</h1>

      {error && (
        <div data-testid="error-message" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name *</label>
          <input
            data-testid="expense-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
          <input
            data-testid="expense-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            data-testid="expense-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            data-testid="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            data-testid="expense-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Among Employees *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {employees.map((emp) => (
              <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  className="rounded"
                  data-testid={`emp-checkbox-${emp.id}`}
                />
                <span className="text-sm">{emp.name} ({emp.id})</span>
              </label>
            ))}
          </div>
          {selectedEmployees.length > 0 && (
            <p data-testid="split-preview" className="text-sm text-gray-500 mt-2">
              Each person pays: ₹{individualShare}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            data-testid="update-btn"
            onClick={handleUpdate}
            disabled={updateExpense.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {updateExpense.isPending ? 'Updating...' : 'Update'}
          </button>
          <button
            data-testid="delete-btn"
            onClick={handleDelete}
            disabled={deleteExpense.isPending}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
