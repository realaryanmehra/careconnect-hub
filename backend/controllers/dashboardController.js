import { ObjectId } from 'mongodb';
import { ensureDB } from '../utils/db.js';
import { safeUser } from '../utils/auth.js';

// PATIENT DASHBOARD - Personal info, tokens, appointments
export const getDashboard = async (req, res) => {
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

    // STEP 1: Parallel fetches (fast)
    const [dashboardDoc, tokens, appointments, user] = await Promise.all([
      globalThis.dashboardCollection.findOne({ userId: new ObjectId(userId) }),
      globalThis.tokensCollection.find({ userId: new ObjectId(userId) }).toArray(),
      globalThis.appointmentsCollection.find({ userId: new ObjectId(userId) }).sort({ date: 1 }).toArray(),
      globalThis.usersCollection.findOne({ _id: new ObjectId(userId) })
    ]);

    // STEP 2: Default dashboard if empty
    const dashboard = dashboardDoc || {
      patientInfo: {},
      vitals: [],
      medicalRecords: [],
      prescriptions: []
    };

    // STEP 3: Filter active tokens
    const activeTokens = tokens.filter(t => ['waiting', 'in-progress'].includes(t.status));

    // STEP 4: Simple appointments list
    const simpleAppointments = appointments.map(apt => ({
      id: apt._id.toString(),
      department: apt.department,
      doctor: apt.doctor,
      date: apt.date,
      time: apt.time,
      status: apt.status
    }));

    console.log('✅ Dashboard loaded for user:', userId);

    // SAME EXACT FORMAT
    res.json({
      patientInfo: { ...dashboard.patientInfo, email: user?.email || '' },
      activeTokens,
      appointments: simpleAppointments,
      vitals: dashboard.vitals || [],
      medicalRecords: dashboard.medicalRecords || [],
      prescriptions: dashboard.prescriptions || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getDashboard };


