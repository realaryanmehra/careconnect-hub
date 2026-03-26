import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { randomUUID } from 'crypto';

// Modular imports
import authRouter from './routes/auth.js';
import { initUserCollection } from './models/User.js';
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
let usersCollection;

/** Connect DB & init */
const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    db = client.db(MONGO_DB_NAME);
    usersCollection = db.collection('users');
    
    await initUserCollection();
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
    process.exit(1);
  }
};

// Routes
app.get('/health', healthCheck);
app.use('/api/auth', authRouter);

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
  });
};

startServer();

