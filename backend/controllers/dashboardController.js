import { ensureDB } from '../utils/db.js';
import { safeUser } from '../utils/auth.js';

// PATIENT DASHBOARD - Personal info, tokens, appointments
export const getDashboard = async (req, res) => {
  if (!req.auth || !req.auth.id) {
    console.error('Dashboard auth missing:', req.auth);
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!globalThis.dbReady) {
    // Demo dashboard
    return res.json({
      patientInfo: { name: 'Demo Patient', email: 'patient@test.com' },
      activeTokens: [],
      appointments: [],
      vitals: [],
      medicalRecords: [],
      prescriptions: []
    });
  }

  try {
    ensureDB();
    const userId = req.auth.id;

    // STEP 1: Mongoose queries only (no BSON issues)
    const [user, tokens, appointments] = await Promise.all([
      globalThis.User.findById(userId),
      globalThis.Token.find({ userId }).sort({ createdAt: -1 }),
      globalThis.Appointment.find({ userId }).sort({ date: 1 })
    ]);

    // STEP 2: Filter active tokens
    const activeTokens = tokens.filter(t => ['waiting', 'in-progress'].includes(t.status || ''));

    // STEP 3: Format appointments
    const simpleAppointments = appointments.map(apt => ({
      id: apt._id.toString(),
      department: apt.department,
      doctor: apt.doctor,
      date: apt.date ? apt.date.toISOString().split('T')[0] : '',
      time: apt.time,
      status: apt.status
    }));

    console.log('✅ Dashboard loaded for user:', userId);

    res.json({
      patientInfo: { 
        name: user?.name || 'Patient', 
        email: user?.email || '',
        role: user?.role || 'patient'
      },
      activeTokens,
      appointments: simpleAppointments,
      vitals: [],
      medicalRecords: [],
      prescriptions: []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getDashboard };


