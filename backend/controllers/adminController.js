// ADMIN CONTROLLERS - Simple admin dashboard data
import { ensureDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

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

export const createAppointment = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const data = req.body;
    const result = await globalThis.appointmentsCollection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || 'upcoming'
    });
    const newApt = { id: result.insertedId.toString(), ...data, _id: result.insertedId };
    res.status(201).json({ appointment: newApt });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointment = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const updates = req.body;
    const result = await globalThis.appointmentsCollection.updateOne(
      { _id: new globalThis.ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Updated', modified: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAppointment = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const result = await globalThis.appointmentsCollection.deleteOne({ _id: new globalThis.ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createToken = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const data = req.body;
    const result = await globalThis.tokensCollection.insertOne({
      ...data,
      status: data.status || 'waiting',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const newToken = { id: result.insertedId.toString(), ...data, _id: result.insertedId };
    res.status(201).json({ token: newToken });
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateToken = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const updates = req.body;
    const result = await globalThis.tokensCollection.updateOne(
      { _id: new globalThis.ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Token not found' });
    res.json({ message: 'Updated', modified: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteToken = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const result = await globalThis.tokensCollection.deleteOne({ _id: new globalThis.ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const updates = req.body;
    // Safe fields only
    const safeUpdates = { role: updates.role };
    const result = await globalThis.usersCollection.updateOne(
      { _id: new globalThis.ObjectId(id) },
      { $set: { ...safeUpdates, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Updated', modified: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });
  try {
    ensureDB();
    const { id } = req.params;
    const result = await globalThis.usersCollection.deleteOne({ _id: new globalThis.ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { 
  getAllUsers, getAllAppointments, getAllTokens, getStatistics,
  createAppointment, updateAppointment, deleteAppointment,
  createToken, updateToken, deleteToken,
  updateUser, deleteUser
};


