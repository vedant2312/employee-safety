import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
  generateQRCode,
  regenerateQRToken,
  uploadPhoto
} from '../controllers/employee.controller.js';
import { protect, isOrganization, isEmployee } from '../middlewares/auth.middleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

// Organization routes (protected)
router.post('/', protect, isOrganization, createEmployee);
router.get('/', protect, isOrganization, getEmployees);
router.get('/:id', protect, isOrganization, getEmployeeById);
router.put('/:id', protect, updateEmployee); // Both org and employee can update
router.delete('/:id', protect, isOrganization, deleteEmployee);

// Photo upload
router.post('/:id/photo', protect, upload.single('photo'), uploadPhoto);

// QR code routes
router.get('/:id/qr', protect, isOrganization, generateQRCode);
router.post('/:id/regenerate-qr', protect, isOrganization, regenerateQRToken);

// Employee self-service routes
router.get('/profile/me', protect, isEmployee, getMyProfile);
router.put('/profile/me', protect, isEmployee, updateMyProfile);

export default router;