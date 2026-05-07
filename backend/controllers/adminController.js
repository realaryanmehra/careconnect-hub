import { ensureDB } from '../utils/db.js';
import { sendEmailNotification } from '../services/notificationService.js';

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
    
    // Step 2: Get all users (hide passwords) using Mongoose model
    const users = await globalThis.User.find({}, '-passwordHash');
    
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
    
    // Step 2: Get all appointments using Mongoose model
    const appointments = await globalThis.Appointment.find({});
    
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
      isTelemedicine: apt.isTelemedicine,
      meetingLink: apt.meetingLink,
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
    
    const tokens = await globalThis.Token.find({}).sort({ createdAt: -1 });
    
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
    
    // STEP 1: Get counts using Mongoose
    const [
      totalUsers,
      totalAppointments,
      totalTokens,
      activeAppointments,
      completedAppointments,
      cancelledAppointments,
      activeTokens,
      recentAppointments,
      recentTokens,
      departments
    ] = await Promise.all([
      globalThis.User.countDocuments({}),
      globalThis.Appointment.countDocuments({}),
      globalThis.Token.countDocuments({}),
      globalThis.Appointment.countDocuments({ status: { $in: ['upcoming', 'in-progress'] } }),
      globalThis.Appointment.countDocuments({ status: 'completed' }),
      globalThis.Appointment.countDocuments({ status: 'cancelled' }),
      globalThis.Token.countDocuments({ status: { $in: ['waiting', 'in-progress'] } }),
      globalThis.Appointment.find({}).sort({ createdAt: -1 }).limit(10),
      globalThis.Token.find({}).sort({ createdAt: -1 }).limit(10),
      globalThis.Appointment.distinct('department')
    ]);

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
      recentAppointments: recentAppointments.map(apt => ({
        id: apt._id.toString(),
        patientName: apt.patientName,
        doctor: apt.doctor,
        department: apt.department,
        date: apt.date,
        time: apt.time,
        status: apt.status || 'upcoming',
        isTelemedicine: apt.isTelemedicine,
        meetingLink: apt.meetingLink
      })),
      recentTokens: recentTokens.map(token => ({
        id: token._id.toString(),
        number: token.number,
        patientName: token.patientName,
        department: token.department,
        status: token.status || 'waiting'
      })),
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
    const appointment = await globalThis.Appointment.create(req.body);
    res.status(201).json({ appointment });
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
    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;
    
    const appointment = await globalThis.Appointment.findByIdAndUpdate(id, updates, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    res.json({ message: 'Updated', appointment });
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
    const result = await globalThis.Appointment.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Not found' });
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
    const token = await globalThis.Token.create(req.body);
    res.status(201).json({ token });
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
    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;
    
    const token = await globalThis.Token.findByIdAndUpdate(id, updates, { new: true });
    if (!token) return res.status(404).json({ message: 'Token not found' });
    
    // Notifications & Socket Events
    if (updates.status) {
      // 1. Emit Socket event for real-time dashboard update
      if (globalThis.io) {
        globalThis.io.emit('tokenUpdated', { 
          id: token._id, 
          status: token.status,
          number: token.number 
        });

        // 2. If status is in-progress, send specialized "Call" event
        if (updates.status === 'in-progress') {
          globalThis.io.emit('tokenCalled', {
            id: token._id,
            number: token.number,
            patientName: token.patientName,
            userId: token.userId
          });
        }
      }

      // 3. Send Email if status is in-progress
      if (updates.status === 'in-progress') {
        console.log('✉️ Status changed to in-progress. Fetching user...');
        try {
          const user = await globalThis.User.findById(token.userId);
          if (user && user.email) {
            console.log(`✉️ Sending email to user: ${user.email}`);
            sendEmailNotification(
              user.email,
              `Your Token #${token.number} is now IN PROGRESS`,
              `Hi ${user.name},\n\nThe doctor is ready for your consultation. Please join the video call from your Tokens page.\n\nToken Number: #${token.number}\nDepartment: ${token.department}\n\nBest regards,\nCareConnect Hub Team`
            );
          } else {
            console.log('✉️ No email found for this user.', user);
          }
        } catch (err) {
          console.error('❌ Failed to fetch user for email notification:', err);
        }
      }
    }
    
    res.json({ message: 'Updated', token });
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
    const result = await globalThis.Token.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Not found' });
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
    const { role } = req.body;
    
    const user = await globalThis.User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'Updated', user });
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
    const result = await globalThis.User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Not found' });
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
