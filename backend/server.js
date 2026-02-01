import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.route.js';
import employeeRoutes from './routes/employee.route.js';
import emergencyRoutes from './routes/emergency.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import organizationRoutes from './routes/organization.route.js';

// load env variables
dotenv.config();

// connect to database
connectDB();

const app = express();

app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);

// test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Error handler (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});