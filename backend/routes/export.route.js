import express from 'express';
import { exportEmployees, exportIncidents } from '../controllers/export.controller.js';
import { protect, isOrganization } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/employees', protect, isOrganization, exportEmployees);
router.get('/incidents', protect, isOrganization, exportIncidents);

export default router;