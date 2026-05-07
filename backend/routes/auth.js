import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { register, login, getMe, googleAuth, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

// POST /google
router.post('/google', googleAuth);

// POST /forgot-password
router.post('/forgot-password', forgotPassword);

// POST /reset-password/:token
router.post('/reset-password/:token', resetPassword);

// GET /me - protected
router.get('/me', authMiddleware, getMe);

export default router;

