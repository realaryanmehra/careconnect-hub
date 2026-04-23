import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { register, login, getMe, googleAuth } from '../controllers/authController.js';

const router = Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

// POST /google
router.post('/google', googleAuth);

// GET /me - protected
router.get('/me', authMiddleware, getMe);

export default router;

