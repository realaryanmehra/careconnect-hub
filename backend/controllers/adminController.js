// ADMIN CONTROLLERS - Simple admin dashboard data
import { ensureDB } from '../utils/db.js';

// GET ALL USERS (admin view)
export const getAllUsers = async (req, res) => {
  if (!globalThis.dbReady) {
    // Demo fallback
    const demoUsers = globalThis.FALLBACK_DATA.users.map(u => ({ 
      ...u, role: u.role || 'patient', 
      createdAt: new Date().toISOString()
    }));
    return res.json({ users: demoUsers });
  }

  try {
    // Step 1: Check DB
    ensureDB();
    
    // Step 2: Get all users (hide passwords)
    const users = await globalThis.usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .toArray();
    
    // Step 3: Convert IDs to strings (same format)
    const simpleUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'patient',
      createdAt: user.createdAt?.toISOString() || null
    }));
    
    res.json({ users: simpleUsers });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getAllAppointments = async (req, res) => {
  if (!globalThis.dbReady) {
    return res.json({ appointments: [] }); // Empty demo
  }

  try {
    // Step 1: Check DB
    ensureDB();
    
    // Step 2: Get all appointments
    const appointments = await globalThis.appointmentsCollection.find({}).toArray();
    
    // Step 3: Simple format (frontend handles dates)
    const simpleAppointments = appointments.map(apt => ({
      id: apt._id.toString(),
      patientName: apt.patientName,
      doctor: apt.doctor,
      department: apt.department,
      date: apt.date,
      time: apt.time,
      phone: apt.phone,
      notes: apt.notes || '',
      status: apt.status || 'upcoming',
      userId: apt.userId?.toString() || null,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    }));
    
    res.json({ appointments: simpleAppointments });
  } catch (error) {
    console.error('Admin appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getAllTokens = async (req, res) => {
  if (!globalThis.dbReady) {
    return res.json({ tokens: [] });
  }

  try {
    ensureDB();
    
    const tokens = await globalThis.tokensCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    const simpleTokens = tokens.map(token => ({
      id: token._id.toString(),
      number: token.number,
      patientName: token.patientName,
      department: token.department,
      position: token.position,
      status: token.status || 'waiting',
      estimatedTime: token.estimatedTime || null,
      userId: token.userId?.toString() || null,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt
    }));
    
    res.json({ tokens: simpleTokens });
  } catch (error) {
    console.error('Admin tokens error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ADMIN STATISTICS - Simple dashboard numbers + lists
export const getStatistics = async (req, res) => {
  if (!globalThis.dbReady) {
    // Demo fallback stats
    return res.json({
      stats: {
        totalUsers: 5,
        totalAppointments: 12,
        totalTokens: 8,
        activeAppointments: 3,
        completedAppointments: 7,
        cancelledAppointments: 2,
        activeTokens: 4
      },
      recentAppointments: [],
      recentTokens: [],
      departments: ['Cardiology', 'General']
    });
  }

  try {
    ensureDB();
    
    // STEP 1: Get counts (simple numbers)
    const totalUsers = await globalThis.usersCollection.countDocuments({});
    const totalAppointments = await globalThis.appointmentsCollection.countDocuments({});
    const totalTokens = await globalThis.tokensCollection.countDocuments({});
    const activeAppointments = await globalThis.appointmentsCollection.countDocuments({ 
      status: { $in: ['upcoming', 'in-progress'] } 
    });
    const completedAppointments = await globalThis.appointmentsCollection.countDocuments({ status: 'completed' });
    const cancelledAppointments = await globalThis.appointmentsCollection.countDocuments({ status: 'cancelled' });
    const activeTokens = await globalThis.tokensCollection.countDocuments({ status: { $in: ['waiting', 'in-progress'] } });

    // STEP 2: Recent appointments (last 10)
    const recentAppointments = await globalThis.appointmentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    const simpleRecentAppts = recentAppointments.map(apt => ({
      id: apt._id.toString(),
      patientName: apt.patientName,
      doctor: apt.doctor,
      department: apt.department,
      date: apt.date,
      time: apt.time,
      status: apt.status || 'upcoming'
    }));

    // STEP 3: Recent tokens (last 10)
    const recentTokens = await globalThis.tokensCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    const simpleRecentTokens = recentTokens.map(token => ({
      id: token._id.toString(),
      number: token.number,
      patientName: token.patientName,
      department: token.department,
      status: token.status || 'waiting'
    }));

    // STEP 4: Unique departments
    const departments = await globalThis.appointmentsCollection.distinct('department');

    // SAME EXACT RESPONSE
    res.json({
      stats: {
        totalUsers,
        totalAppointments,
        totalTokens,
        activeAppointments,
        completedAppointments,
        cancelledAppointments,
        activeTokens,
      },
      recentAppointments: simpleRecentAppts,
      recentTokens: simpleRecentTokens,
      departments: departments || []
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getAllUsers, getAllAppointments, getAllTokens, getStatistics };


