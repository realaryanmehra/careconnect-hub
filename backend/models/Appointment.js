import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  notes: String,
  status: { type: String, default: 'upcoming', enum: ['upcoming', 'in-progress', 'completed', 'cancelled'] },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ date: 1, time: 1 });

export default mongoose.model('Appointment', appointmentSchema);

