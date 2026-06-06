import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';
import {
  getAllUsers,
  getAllAppointments,
  getAllTokens,
  getStatistics,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  createToken,
  updateToken,
  deleteToken,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.get('/appointments', getAllAppointments);
router.get('/tokens', getAllTokens);
router.get('/statistics', getStatistics);

// Admin CRUD Routes
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

router.post('/tokens', createToken);
router.put('/tokens/:id', updateToken);
router.delete('/tokens/:id', deleteToken);

router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

