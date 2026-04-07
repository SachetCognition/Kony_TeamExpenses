import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEmployee } from '../api/hooks';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!id.trim()) {
      setError('Employee ID is required');
      return;
    }
    if (!name.trim()) {
      setError('Employee name is required');
      return;
    }
    try {
      await createEmployee.mutateAsync({
        id: id.trim(),
        name: name.trim(),
        isAdmin,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Employee</h1>

      {error && (
        <div data-testid="error-message" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
          <input
            data-testid="employee-id"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. EMP006"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
          <input
            data-testid="employee-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Is Admin?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isAdmin"
                checked={isAdmin === true}
                onChange={() => setIsAdmin(true)}
                data-testid="admin-yes"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isAdmin"
                checked={isAdmin === false}
                onChange={() => setIsAdmin(false)}
                data-testid="admin-no"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            data-testid="create-btn"
            onClick={handleSubmit}
            disabled={createEmployee.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {createEmployee.isPending ? 'Creating...' : 'Create'}
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
