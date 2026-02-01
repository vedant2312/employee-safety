import express from 'express';
import {
  getOrganizationProfile,
  updateOrganizationSettings,
  updateOrganizationPassword,
  deleteOrganizationAccount
} from '../controllers/organization.controller.js';
import { protect, isOrganization } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, isOrganization, getOrganizationProfile);
router.put('/settings', protect, isOrganization, updateOrganizationSettings);
router.put('/password', protect, isOrganization, updateOrganizationPassword);
router.delete('/account', protect, isOrganization, deleteOrganizationAccount);

export default router;