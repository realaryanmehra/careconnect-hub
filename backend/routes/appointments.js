import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { bookAppointment } from '../controllers/appointmentController.js';

const router = express.Router();

// POST /api/appointments - Book new appointment
router.post('/', authMiddleware, bookAppointment);

// GET /api/appointments - Get user appointments (optional, dashboard covers)
router.get('/', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Use /api/dashboard for appointments' });
});

export default router;

