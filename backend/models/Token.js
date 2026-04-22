import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  number: { type: Number, required: true },
  patientName: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, default: 'waiting', enum: ['waiting', 'in-progress', 'completed'] },
  position: Number,
  estimatedTime: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

tokenSchema.index({ userId: 1 });
tokenSchema.index({ status: 1 });

export default mongoose.model('Token', tokenSchema);

