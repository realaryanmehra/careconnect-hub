import express from 'express';
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  addDoctor,
  removeDoctor
} from '../controllers/departmentController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

// Public route to get departments
router.get('/', getDepartments);

// Admin routes for managing departments
router.post('/', authMiddleware, adminMiddleware, createDepartment);
router.put('/:id', authMiddleware, adminMiddleware, updateDepartment);
router.delete('/:id', authMiddleware, adminMiddleware, deleteDepartment);

// Admin routes for managing doctors within departments
router.post('/:departmentId/doctors', authMiddleware, adminMiddleware, addDoctor);
router.delete('/:departmentId/doctors/:doctorId', authMiddleware, adminMiddleware, removeDoctor);

export default router;
