import express from 'express';
import {
  registerOrganization,
  loginOrganization,
  loginEmployee
} from '../controllers/auth.controller.js';

const router = express.Router();

// Organization routes
router.post('/organization/register', registerOrganization);
router.post('/organization/login', loginOrganization);

// Employee routes
router.post('/employee/login', loginEmployee);

export default router;