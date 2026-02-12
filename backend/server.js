import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import { configureCloudinary, testCloudinaryUpload } from './config/cloudinary.js';
import authRoutes from './routes/auth.route.js';
import employeeRoutes from './routes/employee.route.js';
import emergencyRoutes from './routes/emergency.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import exportRoutes from './routes/export.route.js';
import organizationRoutes from './routes/organization.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary AFTER environment variables are loaded
configureCloudinary();

// Test Cloudinary upload
testCloudinaryUpload()
  .then(() => console.log('✅ Cloudinary is ready!\n'))
  .catch(err => console.error('❌ Cloudinary test failed:', err.message, '\n'));

// Connect to database
connectDB();

// Initialize Express
const app = express();

// CORS - Allow both local and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// Error handler (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});