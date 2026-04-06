import { getDashboardByUserId } from '../models/Dashboard.js';
import { findTokensByUser } from '../models/Token.js';
import { findAppointmentsByUser } from '../models/Appointment.js';
import { findById } from '../models/User.js';
import { safeUser } from '../utils/auth.js';

// Get dashboard data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.auth.id;
    const [dashboard, tokens, appointments, user] = await Promise.all([
      getDashboardByUserId(userId),
      findTokensByUser(userId),
      findAppointmentsByUser(userId),
      findById(userId)
    ]);
    
    const activeTokens = tokens.filter(t => ['waiting', 'in-progress'].includes(t.status));
    const transformedAppointments = appointments.map(apt => ({
      id: apt._id.toString(), department: apt.department, doctor: apt.doctor,
      date: apt.date.toISOString().split('T')[0], time: apt.time, status: apt.status
    }));
    
    console.log('Dashboard loaded for:', userId);
    
    return res.json({
      patientInfo: { ...dashboard.patientInfo, email: user.email },
      activeTokens, appointments: transformedAppointments,
      vitals: dashboard.vitals, medicalRecords: dashboard.medicalRecords,
      prescriptions: dashboard.prescriptions
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getDashboard };

