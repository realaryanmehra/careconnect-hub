import { ensureDB } from '../utils/db.js';

// BOOK APPOINTMENT - Patient schedules doctor visit
export const bookAppointment = async (req, res) => {
  if (!req.auth || !req.auth.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!globalThis.dbReady) {
    // Demo - return fake booking
    return res.status(201).json({
      appointment: {
        id: 'demo-appt-1',
        department: req.body.department || 'General',
        doctor: req.body.doctor || 'Dr Smith',
        status: 'upcoming'
      }
    });
  }

  try {
    // Step 1: Check required fields
    const { department, doctor, date, time, patientName, phone, notes = '' } = req.body;
    if (!department || !doctor || !date || !time || !patientName || !phone) {
      return res.status(400).json({ message: 'Missing: department, doctor, date, time, name, phone' });
    }

    ensureDB();

    // Step 2: Use Mongoose model (no ObjectId issues)
    const newAppointment = await globalThis.Appointment.create({
      department,
      doctor,
      date: new Date(date),
      time,
      patientName,
      phone,
      notes,
      status: 'upcoming',
      userId: req.auth.id,
      createdAt: new Date()
    });

    console.log('✅ Appointment booked:', newAppointment._id);

    res.status(201).json({
      appointment: {
        id: newAppointment._id.toString(),
        department: newAppointment.department,
        doctor: newAppointment.doctor,
        date: newAppointment.date.toISOString().split('T')[0],
        time: newAppointment.time,
        status: newAppointment.status,
        patientName: newAppointment.patientName,
        phone: newAppointment.phone
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error.message);
    res.status(500).json({ message: 'Booking failed - try again' });
  }
};

// Redirect to dashboard
export const getAppointments = async (req, res) => {
  res.status(501).json({ message: 'Use GET /api/dashboard for appointments' });
};

export default { bookAppointment, getAppointments };


