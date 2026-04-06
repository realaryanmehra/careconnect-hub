import { ObjectId } from 'mongodb';

// Appointment operations for patient scheduling
export const findAppointmentsByUser = async (userId) => {
  if (!globalThis.appointmentsCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.appointmentsCollection.find({ userId: new ObjectId(userId) }).sort({ date: 1, time: 1 }).toArray();
};

export const findAppointmentById = async (id, userId) => {
  if (!globalThis.appointmentsCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.appointmentsCollection.findOne({ 
    _id: new ObjectId(id), 
    userId: new ObjectId(userId) 
  });
};

export const createAppointment = async (appointmentData, userId) => {
  const newAppointment = {
    _id: new ObjectId(),
    department: appointmentData.department,
    doctor: appointmentData.doctor,
    date: new Date(appointmentData.date),
    time: appointmentData.time,
    patientName: appointmentData.patientName,
    phone: appointmentData.phone,
    status: appointmentData.status || 'upcoming',
    notes: appointmentData.notes || '',
    createdAt: new Date(),
    userId: new ObjectId(userId),
  };
  
  if (!globalThis.appointmentsCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  
  await globalThis.appointmentsCollection.insertOne(newAppointment);
  return newAppointment;
};

export const updateAppointmentStatus = async (id, status, userId) => {
  if (!globalThis.appointmentsCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  const result = await globalThis.appointmentsCollection.updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { status, updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new Error('Appointment not found');
  }
  return result;
};

export const initAppointmentCollection = async () => {
  if (!globalThis.appointmentsCollection) {
    throw new Error('appointmentsCollection is not initialized. Check server.js connection.');
  }
  await globalThis.appointmentsCollection.createIndex({ userId: 1 });
  await globalThis.appointmentsCollection.createIndex({ date: 1, time: 1 });
  await globalThis.appointmentsCollection.createIndex({ status: 1 });
  console.log('✅ Appointments collection ready with indexes!');
};

export default { findAppointmentsByUser, findAppointmentById, createAppointment, updateAppointmentStatus, initAppointmentCollection };

