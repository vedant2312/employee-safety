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
import { getUpload } from '../config/cloudinary.js';

const router = express.Router();

// Organization routes (protected)
router.post('/', protect, isOrganization, createEmployee);
router.get('/', protect, isOrganization, getEmployees);
router.get('/:id', protect, isOrganization, getEmployeeById);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, isOrganization, deleteEmployee);

// Photo upload - using Cloudinary (use getUpload() to get configured multer instance)
router.post('/:id/photo', protect, (req, res, next) => {
  const upload = getUpload();
  upload.single('photo')(req, res, next);
}, uploadPhoto);

// QR code routes
router.get('/:id/qr', protect, isOrganization, generateQRCode);
router.post('/:id/regenerate-qr', protect, isOrganization, regenerateQRToken);

// Employee self-service routes
router.get('/profile/me', protect, isEmployee, getMyProfile);
router.put('/profile/me', protect, isEmployee, updateMyProfile);

export default router;