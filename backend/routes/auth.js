import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { register, login, getMe } from '../controllers/authController.js';

const router = Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

// GET /me - protected
router.get('/me', authMiddleware, getMe);

export default router;

