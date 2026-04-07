import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useExpenses,
  useDashboardSummary,
  useEmployeeShares,
  useCategoryExpenses,
} from '../api/hooks';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
  const { data: summary } = useDashboardSummary();
  const { data: employeeShares = [] } = useEmployeeShares();
  const { data: categoryExpenses = [] } = useCategoryExpenses();

  const filteredShares = searchTerm
    ? employeeShares.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : employeeShares;

  const totalOwed = filteredShares.reduce((sum, s) => sum + s.totalShare, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3">
          <button
            data-testid="add-expense-btn"
            onClick={() => navigate('/add-expense')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Expense
          </button>
          <button
            data-testid="add-employee-btn"
            onClick={() => navigate('/add-employee')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Employee
          </button>
          <button
            data-testid="add-category-btn"
            onClick={() => navigate('/add-category')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Amount Spent</p>
          <p data-testid="total-spent" className="text-2xl font-bold text-gray-800">
            ₹{summary?.totalSpent?.toFixed(2) ?? '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Gets Back</p>
          <p data-testid="gets-back" className="text-2xl font-bold text-green-600">
            ₹{(summary?.getsBack ?? totalOwed).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Categories</p>
          <div className="space-y-1 mt-2">
            {categoryExpenses.map((cat) => (
              <div key={cat.categoryId} className="flex justify-between text-sm">
                <span className="text-gray-600">{cat.categoryName}</span>
                <span className="font-medium">₹{cat.totalExpense.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense List */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
          </div>
          <div className="divide-y">
            {loadingExpenses ? (
              <p className="p-6 text-gray-500">Loading...</p>
            ) : expenses.length === 0 ? (
              <p className="p-6 text-gray-500">No expenses yet</p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  data-testid={`expense-row-${expense.id}`}
                  onClick={() => navigate(`/edit-expense/${expense.id}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{expense.name}</p>
                    <p className="text-sm text-gray-500">
                      {expense.categoryName} &middot; {expense.date}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">₹{expense.expenditure.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee Shares */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Who Owes What</h2>
            <div className="mt-3 flex gap-2">
              <input
                data-testid="search-input"
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              {searchTerm && (
                <button
                  data-testid="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="divide-y">
            {filteredShares.length === 0 ? (
              <p className="p-6 text-gray-500">No outstanding amounts</p>
            ) : (
              filteredShares.map((share) => (
                <div
                  key={share.employeeId}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{share.name}</p>
                    <p className="text-sm text-red-500">₹{share.totalShare.toFixed(2)}</p>
                  </div>
                  <button
                    data-testid={`settle-btn-${share.employeeId}`}
                    onClick={() => navigate(`/settle-up/${share.employeeId}`)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    Settle Up
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
