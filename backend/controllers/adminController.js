// Admin controllers
import { safeUser } from '../utils/auth.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await globalThis.usersCollection.find({}, { projection: { passwordHash: 0 } }).toArray();
    
    // Format users for frontend display
    const formattedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'patient',
      createdAt: user.createdAt?.toISOString() || null
    }));
    
    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await globalThis.appointmentsCollection.find({}).toArray();
    
    // Format appointments for frontend display
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id.toString(),
      patientName: apt.patientName,
      doctor: apt.doctor,
      department: apt.department,
      date: apt.date instanceof Date ? apt.date.toISOString().split('T')[0] : apt.date,
      time: apt.time,
      phone: apt.phone,
      notes: apt.notes || '',
      status: apt.status || 'upcoming',
      userId: apt.userId?.toString() || null,
      createdAt: apt.createdAt?.toISOString() || null,
      updatedAt: apt.updatedAt?.toISOString() || null
    }));
    
    return res.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Admin appointments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTokens = async (req, res) => {
  try {
    const tokens = await globalThis.tokensCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Format tokens for frontend display
    const formattedTokens = tokens.map(token => ({
      _id: token._id.toString(),
      number: token.number,
      patientName: token.patientName,
      department: token.department,
      position: token.position,
      status: token.status || 'waiting',
      estimatedTime: token.estimatedTime || null,
      userId: token.userId?.toString() || null,
      createdAt: token.createdAt?.toISOString() || null,
      updatedAt: token.updatedAt?.toISOString() || null
    }));
    
    return res.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Admin tokens error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
export const getStatistics = async (req, res) => {
  try {
    const totalUsers = await globalThis.usersCollection.countDocuments({});
    const totalAppointments = await globalThis.appointmentsCollection.countDocuments({});
    const totalTokens = await globalThis.tokensCollection.countDocuments({});
    const activeAppointments = await globalThis.appointmentsCollection.countDocuments({ 
      status: { $in: ['upcoming', 'in-progress'] } 
    });
    const completedAppointments = await globalThis.appointmentsCollection.countDocuments({ 
      status: 'completed' 
    });
    const cancelledAppointments = await globalThis.appointmentsCollection.countDocuments({ 
      status: 'cancelled' 
    });
    const activeTokens = await globalThis.tokensCollection.countDocuments({ 
      status: { $in: ['waiting', 'in-progress'] } 
    });

    // Get recent appointments with formatting
    const recentAppointments = (await globalThis.appointmentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()).map(apt => ({
        _id: apt._id.toString(),
        patientName: apt.patientName,
        doctor: apt.doctor,
        department: apt.department,
        date: apt.date instanceof Date ? apt.date.toISOString().split('T')[0] : apt.date,
        time: apt.time,
        status: apt.status || 'upcoming',
        createdAt: apt.createdAt?.toISOString() || null
      }));

    // Get recent tokens with formatting
    const recentTokens = (await globalThis.tokensCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()).map(token => ({
        _id: token._id.toString(),
        number: token.number,
        patientName: token.patientName,
        department: token.department,
        status: token.status || 'waiting',
        createdAt: token.createdAt?.toISOString() || null
      }));

    // Get departments list
    const departments = await globalThis.appointmentsCollection.distinct('department');

    return res.json({
      stats: {
        totalUsers,
        totalAppointments,
        totalTokens,
        activeAppointments,
        completedAppointments,
        cancelledAppointments,
        activeTokens,
      },
      recentAppointments,
      recentTokens,
      departments: departments || []
    });
  } catch (error) {
    console.error('Admin statistics error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getAllUsers, getAllAppointments, getAllTokens, getStatistics };

