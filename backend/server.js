import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/database.js';
import authRouter from './routes/auth.js';
import tokenRouter from './routes/tokens.js';
import dashboardRouter from './routes/dashboard.js';
import appointmentRouter from './routes/appointments.js';
import adminRouter from './routes/admin.js';
import departmentRouter from './routes/departments.js';
import { healthCheck } from './controllers/authController.js';

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Make io globally available
globalThis.io = io;

io.on('connection', (socket) => {
  console.log('🔗 Client connected to Socket.io:', socket.id);
  
  // WebRTC Signaling Events
  socket.on('join-consultation-room', (roomId) => {
    socket.join(roomId);
    console.log(`📹 User ${socket.id} joined room: ${roomId}`);
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('webrtc-offer', (data) => {
    socket.to(data.roomId).emit('webrtc-offer', {
      offer: data.offer,
      senderId: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.roomId).emit('webrtc-answer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(data.roomId).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  socket.on('leave-consultation-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

globalThis.dbReady = false;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow any frontend domain (like Vercel) to connect
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
app.use('/api/departments', departmentRouter);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
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

