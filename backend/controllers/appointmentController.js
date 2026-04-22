import { ObjectId } from 'mongodb';
import { ensureDB } from '../utils/db.js';

// BOOK APPOINTMENT - Patient schedules doctor visit
export const bookAppointment = async (req, res) => {
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

    // Step 2: Check DB ready
    ensureDB();

    // Step 3: Create appointment data
    const newAppointment = {
      _id: new ObjectId(),
      department,
      doctor,
      date: new Date(date),
      time,
      patientName,
      phone,
      notes,
      status: 'upcoming',
      userId: new ObjectId(req.auth.id),
      createdAt: new Date()
    };

    // Step 4: Save to database
    await globalThis.appointmentsCollection.insertOne(newAppointment);

    console.log('✅ Appointment booked:', newAppointment._id);

    // Step 5: Same response format
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


