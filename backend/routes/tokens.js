import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getTokens, generateToken, updateTokenStatus } from '../controllers/tokenController.js';

const router = express.Router();

// GET /api/tokens - Get user's tokens
router.get('/', authMiddleware, getTokens);

// POST /api/tokens - Generate new token
router.post('/', authMiddleware, generateToken);

// PATCH /api/tokens/:id/status - Update specific token status
router.patch('/:id/status', authMiddleware, updateTokenStatus);

export default router;

