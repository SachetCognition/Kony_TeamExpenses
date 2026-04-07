import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, useEmployees, useCreateExpense } from '../api/hooks';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: employees = [] } = useEmployees();
  const createExpense = useCreateExpense();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [error, setError] = useState('');

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedEmployees(employees.map((e) => e.id));
  const clearAll = () => setSelectedEmployees([]);

  const handleSubmit = async () => {
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
      await createExpense.mutateAsync({
        name: name.trim(),
        expenditure: Number(amount),
        categoryId: Number(categoryId) || categories[0]?.id,
        employeeIds: selectedEmployees,
        comment: comment || undefined,
        date,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
    }
  };

  const individualShare =
    selectedEmployees.length > 0 && Number(amount) > 0
      ? (Number(amount) / selectedEmployees.length).toFixed(2)
      : '0.00';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Expense</h1>

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
            placeholder="e.g. Team Lunch"
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
            placeholder="0"
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
            <option value="">Select category</option>
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
            placeholder="Optional description"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Split Among Employees *
            </label>
            <div className="flex gap-2">
              <button
                data-testid="select-all-btn"
                type="button"
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                data-testid="clear-all-btn"
                type="button"
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {employees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center gap-2 cursor-pointer"
              >
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
            data-testid="submit-btn"
            onClick={handleSubmit}
            disabled={createExpense.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {createExpense.isPending ? 'Creating...' : 'Proceed'}
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
