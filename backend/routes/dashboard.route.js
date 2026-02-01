import express from 'express';
import {
  getDashboardStats,
  getRecentIncidents
} from '../controllers/dashboard.controller.js';
import { protect, isOrganization } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, isOrganization, getDashboardStats);
router.get('/recent-incidents', protect, isOrganization, getRecentIncidents);

export default router;