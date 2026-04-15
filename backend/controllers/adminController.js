// Admin controllers
import { safeUser } from '../utils/auth.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}, { projection: { passwordHash: 0 } }).toArray();
    return res.json({ users: users.map(safeUser) });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentsCollection.find({}).toArray();
    return res.json({ appointments });
  } catch (error) {
    console.error('Admin appointments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTokens = async (req, res) => {
  try {
    const tokens = await tokensCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.json({ tokens });
  } catch (error) {
    console.error('Admin tokens error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
export const getStatistics = async (req, res) => {
  try {
    const totalUsers = await usersCollection.countDocuments({});
    const totalAppointments = await appointmentsCollection.countDocuments({});
    const totalTokens = await tokensCollection.countDocuments({});
    const activeAppointments = await appointmentsCollection.countDocuments({ 
      status: { $in: ['upcoming', 'in-progress'] } 
    });
    const completedAppointments = await appointmentsCollection.countDocuments({ 
      status: 'completed' 
    });
    const cancelledAppointments = await appointmentsCollection.countDocuments({ 
      status: 'cancelled' 
    });
    const activeTokens = await tokensCollection.countDocuments({ 
      status: { $in: ['waiting', 'in-progress'] } 
    });

    // Get recent appointments
    const recentAppointments = await appointmentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get recent tokens
    const recentTokens = await tokensCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get departments list
    const departments = await appointmentsCollection.distinct('department');

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

