import mongoose from 'mongoose';

const dashboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  patientInfo: {
    name: String,
    phone: String,
    address: String,
    bloodGroup: String
  },
  vitals: [{
    type: { type: String },
    value: String,
    date: Date
  }],
  medicalRecords: [{
    title: String,
    date: Date,
    notes: String
  }],
  prescriptions: [{
    medication: String,
    dosage: String,
    doctor: String,
    date: Date
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
}, { timestamps: true });

export default mongoose.model('Dashboard', dashboardSchema);

