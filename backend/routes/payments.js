import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { processDemoPayment } from '../controllers/paymentController.js';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

router.post('/demo-pay', processDemoPayment);

export default router;
