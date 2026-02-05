import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/organization.controller.js';
import { protect, isOrganization } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, isOrganization, getProfile);
router.put('/profile', protect, isOrganization, updateProfile);
router.put('/change-password', protect, isOrganization, changePassword);

export default router;