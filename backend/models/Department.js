import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  speciality: { type: String }
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String }, // Storing lucide icon name as a string
  doctors: [doctorSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Department', departmentSchema);
