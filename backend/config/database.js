import dns from 'dns';
// Force Node.js to use Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Token from '../models/Token.js';
import Appointment from '../models/Appointment.js';
import Dashboard from '../models/Dashboard.js';

const ensureFallbackData = () => {
  if (globalThis.FALLBACK_DATA) return;

  globalThis.FALLBACK_DATA = {
    users: [
      {
        _id: 'demo-admin-1',
        name: 'Admin',
        email: 'samar@gmail.com',
        passwordHash: bcrypt.hashSync('samarpreet', 10),
        role: 'admin',
        createdAt: new Date()
      }
    ],
    tokens: [],
    appointments: []
  };
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || undefined,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    const adminEmail = 'samar@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const adminPasswordHash = await bcrypt.hash('samarpreet', 10);
      await User.create({
        name: 'Admin',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'admin'
      });
      console.log('Admin user created: samar@gmail.com / samarpreet');
    } else {
      console.log('Admin user already exists');
    }

    const db = conn.connection.db;
    globalThis.usersCollection = db.collection('users');
    globalThis.tokensCollection = db.collection('tokens');
    globalThis.appointmentsCollection = db.collection('appointments');
    globalThis.dashboardCollection = db.collection('dashboards');
    globalThis.dbReady = true;

    globalThis.User = User;
    globalThis.Token = Token;
    globalThis.Appointment = Appointment;
    globalThis.Dashboard = Dashboard;

    console.log('All collections ready');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    globalThis.dbReady = false;
    ensureFallbackData();
    return false;
  }
};

export default connectDB;
