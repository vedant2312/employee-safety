import express from 'express';
import {
  getEmployeeByQRToken,
  triggerSOS,
  getIncidentHistory,
  getAllIncidents
} from '../controllers/emergency.controller.js';
import { protect, isOrganization } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:qrToken', getEmployeeByQRToken);
router.post('/:qrToken/sos', triggerSOS);

// Protected routes (organization only)
router.get('/incidents/all', protect, isOrganization, getAllIncidents);
router.get('/incidents/:employeeId', protect, isOrganization, getIncidentHistory);

export default router;