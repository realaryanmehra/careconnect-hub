import { createAppointment } from '../models/Appointment.js';
import { upsertDashboardData } from '../models/Dashboard.js';
import { findById } from '../models/User.js';

// POST /api/appointments - Book new appointment
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { department, doctor, date, time, patientName, phone, notes = '' } = req.body;

// 🔍 ENHANCED DEBUG LOGGING
    console.log('📥 FULL req.body:', JSON.stringify(req.body, null, 2));
    console.log('📏 Body size:', JSON.stringify(req.body).length);
    console.log('🔑 Content-Type:', req.get('Content-Type'));
    console.log('🔑 Auth header:', req.headers.authorization?.substring(0, 50) + '...');
    console.log('👤 req.auth:', req.auth);
    
    console.log('📋 Destructured fields:', { department, doctor, date, time, patientName, phone });

    if (!department || !doctor || !date || !time || !patientName || !phone) {
      return res.status(400).json({ message: 'Missing required fields: department, doctor, date, time, patientName, phone', received: req.body });
    }

    // Create appointment data
    const appointmentData = {
      department,
      doctor,
      date,
      time,
      patientName,
      phone,
      notes: notes || '',
      status: 'upcoming'
    };

    // Create appointment
    const newAppointment = await createAppointment(appointmentData, userId);

    // Update dashboard with new appointment
    await upsertDashboardData(userId, 'appointments', [newAppointment]);

    console.log(`📅 Appointment booked: ${newAppointment._id} for user: ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
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
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

export const getAppointments = async (req, res) => {
  // Reuse dashboard logic or separate
  // For now, redirect to dashboard or implement
  res.status(501).json({ message: 'Not implemented yet - use /api/dashboard' });
};

export default { bookAppointment, getAppointments };

