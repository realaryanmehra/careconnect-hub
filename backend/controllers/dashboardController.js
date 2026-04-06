import { getDashboardByUserId } from '../models/Dashboard.js';
import { findTokensByUser } from '../models/Token.js';
import { findAppointmentsByUser } from '../models/Appointment.js';
import { findById } from '../models/User.js';
import { safeUser } from '../utils/auth.js';

// GET /api/dashboard - Get complete dashboard data for authenticated user
export const getDashboard = async (req, res) => {
  try {
    const userId = req.auth.id;
    
    // Parallel fetches
    const [dashboard, tokens, appointments, user] = await Promise.all([
      getDashboardByUserId(userId),
      findTokensByUser(userId),
      findAppointmentsByUser(userId),
      findById(userId)
    ]);
    
    // Filter active tokens (only waiting/in-progress)
    const activeTokens = tokens.filter(t => ['waiting', 'in-progress'].includes(t.status));
    
    // Transform appointments for frontend
    const transformedAppointments = appointments.map(apt => ({
      id: apt._id.toString(),
      department: apt.department,
      doctor: apt.doctor,
      date: apt.date.toISOString().split('T')[0],
      time: apt.time,
      status: apt.status
    }));
    
    console.log(`📊 Dashboard loaded for user: ${userId}`);
    
    return res.json({
      success: true,
      patientInfo: {
        ...dashboard.patientInfo,
        email: user.email // Sync from user
      },
      activeTokens,
      appointments: transformedAppointments,
      vitals: dashboard.vitals,
      medicalRecords: dashboard.medicalRecords,
      prescriptions: dashboard.prescriptions
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

export default { getDashboard };

