import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';
import { getAllUsers, getAllAppointments, getAllTokens, getStatistics } from '../controllers/adminController.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.get('/appointments', getAllAppointments);
router.get('/tokens', getAllTokens);
router.get('/statistics', getStatistics);

export default router;

