import dns from 'dns';
// Force Node.js to use Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Token from '../models/Token.js';
import Appointment from '../models/Appointment.js';
import Dashboard from '../models/Dashboard.js';
import Department from '../models/Department.js';

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

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('Seeding initial departments...');
      const initialDepts = [
        { name: "Cardiology", description: "Comprehensive heart care", icon: "Heart", doctors: [{ name: "Dr. Anil Kapoor", speciality: "Cardiologist", email: "anil.k@hospital.com" }, { name: "Dr. Meena Singh", speciality: "Cardiac Surgeon", email: "meena.s@hospital.com" }] },
        { name: "Neurology", description: "Expert nervous system care", icon: "Brain", doctors: [{ name: "Dr. Rajesh Gupta", speciality: "Neurologist", email: "rajesh.g@hospital.com" }, { name: "Dr. Sonal Verma", speciality: "Neurosurgeon", email: "sonal.v@hospital.com" }] },
        { name: "Orthopedics", description: "Musculoskeletal conditions", icon: "Bone", doctors: [{ name: "Dr. Vikram Rao", speciality: "Orthopedist", email: "vikram.r@hospital.com" }, { name: "Dr. Deepa Joshi", speciality: "Sports Medicine", email: "deepa.j@hospital.com" }] },
        { name: "Pediatrics", description: "Healthcare for children", icon: "Baby", doctors: [{ name: "Dr. Kavita Sharma", speciality: "Pediatrician", email: "kavita.s@hospital.com" }, { name: "Dr. Ravi Mishra", speciality: "Pediatric Surgeon", email: "ravi.m@hospital.com" }] },
        { name: "Ophthalmology", description: "Complete eye care", icon: "Eye", doctors: [{ name: "Dr. Sunita Patel", speciality: "Ophthalmologist", email: "sunita.p@hospital.com" }, { name: "Dr. Aman Khanna", speciality: "Retina Specialist", email: "aman.k@hospital.com" }] },
        { name: "General Medicine", description: "Primary healthcare", icon: "Stethoscope", doctors: [{ name: "Dr. Pooja Reddy", speciality: "General Physician", email: "pooja.r@hospital.com" }, { name: "Dr. Nikhil Bhatt", speciality: "Internal Medicine", email: "nikhil.b@hospital.com" }] }
      ];
      await Department.insertMany(initialDepts);
      console.log('Departments seeded successfully');
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
    globalThis.Department = Department;

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
