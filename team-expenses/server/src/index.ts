import express from 'express';
import cors from 'cors';
import expenseRoutes from './routes/expenses';
import dashboardRoutes from './routes/dashboard';
import settleRoutes from './routes/settle';
import categoryRoutes from './routes/categories';
import employeeRoutes from './routes/employees';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settle', settleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Only start listening when run directly (not imported by tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
