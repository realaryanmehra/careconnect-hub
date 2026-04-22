import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRouter from './routes/auth.js';
import tokenRouter from './routes/tokens.js';
import dashboardRouter from './routes/dashboard.js';
import appointmentRouter from './routes/appointments.js';
import adminRouter from './routes/admin.js';
import { healthCheck } from './controllers/authController.js';

dotenv.config();

const app = express();
globalThis.dbReady = false;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'], // Allow both Vite default and configured port
  credentials: true
}));

const PORT = process.env.PORT || 5001;

// Health check
app.get('/health', healthCheck);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/admin', adminRouter);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('Endpoints:');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  GET /api/auth/me');
      console.log('  POST /api/tokens/generate');
      console.log('  GET /api/dashboard');
      console.log('  POST /api/appointments/book');
      console.log('Admin login: samar@gmail.com / samarpreet');
    });
  } catch (error) {
    console.error('Server failed to start:', error);
  }
};

startServer();

