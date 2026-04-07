import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-5xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Expense Tracker</h1>
        <p className="text-gray-500 mb-8">Track, split, and settle team expenses</p>
        <button
          data-testid="login-button"
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
