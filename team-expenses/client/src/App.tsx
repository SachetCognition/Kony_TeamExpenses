import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddExpensePage from './pages/AddExpensePage';
import EditExpensePage from './pages/EditExpensePage';
import AddCategoryPage from './pages/AddCategoryPage';
import AddEmployeePage from './pages/AddEmployeePage';
import SettleUpPage from './pages/SettleUpPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/edit-expense/:id" element={<EditExpensePage />} />
        <Route path="/add-category" element={<AddCategoryPage />} />
        <Route path="/add-employee" element={<AddEmployeePage />} />
        <Route path="/settle-up/:employeeId" element={<SettleUpPage />} />
      </Routes>
    </div>
  );
}

export default App;
