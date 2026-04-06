import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

// Modular imports
import authRouter from './routes/auth.js';
import { initUserCollection } from './models/User.js';
import { initTokenCollection } from './models/Token.js';
import { initAppointmentCollection } from './models/Appointment.js';
import { initDashboardCollection } from './models/Dashboard.js';
import { healthCheck } from './controllers/authController.js';

// Load env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'careconnect';

// Globals for DB
let db;

/** Connect DB & init */
const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    db = client.db(MONGO_DB_NAME);
    console.log('📁 Database selected:', MONGO_DB_NAME);
    
    globalThis.usersCollection = db.collection('users');
    globalThis.tokensCollection = db.collection('tokens');
    globalThis.appointmentsCollection = db.collection('appointments');
    globalThis.dashboardCollection = db.collection('dashboard');
    
    console.log('👥 Users collection ready');
    console.log('🎫 Tokens collection ready');
    console.log('📅 Appointments collection ready');
    console.log('📊 Dashboard collection ready');
    
    // Initialize all collections
    await Promise.all([
      initUserCollection(),
      initTokenCollection(),
      initAppointmentCollection(),
      initDashboardCollection()
    ]);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Check: MONGO_URI, MongoDB running, network');
    process.exit(1);
  }
};

// Routes
app.get('/health', healthCheck);
app.use('/api/auth', authRouter);

// Import routers
import tokenRouter from './routes/tokens.js';
import dashboardRouter from './routes/dashboard.js';
import appointmentRouter from './routes/appointments.js';

app.use('/api/tokens', tokenRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/appointments', appointmentRouter);

/** Start server */
const startServer = async () => {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET /health');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
    console.log('  GET /api/auth/me (protected)');
    console.log('  POST /api/tokens (protected)');
    console.log('  GET /api/dashboard (protected)');
    console.log('  POST /api/appointments (protected)');
  });
};

startServer();
