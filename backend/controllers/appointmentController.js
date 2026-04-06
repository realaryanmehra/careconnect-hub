import { createAppointment } from '../models/Appointment.js';
import { upsertDashboardData } from '../models/Dashboard.js';
import { findById } from '../models/User.js';

// Book new appointment
export const bookAppointment = async (req, res) => {
  try {
    const { department, doctor, date, time, patientName, phone, notes = '' } = req.body;
    if (!department || !doctor || !date || !time || !patientName || !phone) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const appointmentData = { department, doctor, date, time, patientName, phone, notes, status: 'upcoming' };
    const newAppointment = await createAppointment(appointmentData, req.auth.id);
    await upsertDashboardData(req.auth.id, 'appointments', [newAppointment]);

    console.log('Appointment booked:', newAppointment._id);
    
    return res.status(201).json({
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
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get appointments (use dashboard endpoint)
export const getAppointments = async (req, res) => res.status(501).json({ message: 'Use /api/dashboard' });

export default { bookAppointment, getAppointments };

