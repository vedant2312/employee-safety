// ⚠️ CRITICAL: Load dotenv FIRST
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
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

// Debug - check if env vars are loaded
console.log('\n=== Environment Variables Check ===');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Loaded ✓' : 'Missing ✗');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Loaded ✓' : 'Missing ✗');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'Loaded ✓' : 'Missing ✗');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded ✓' : 'Missing ✗');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Loaded ✓' : 'Missing ✗');
console.log('====================================\n');

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

// Middleware
app.use(cors());
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
  res.json({ message: 'Server is running!' });
});

// Error handler (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}\n`);
});