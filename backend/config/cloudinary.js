import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

let isConfigured = false;
let storage = null;
let upload = null;

// Function to configure Cloudinary (called after dotenv loads)
export const configureCloudinary = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // console.log('=== Configuring Cloudinary ===');
  // console.log('Cloud Name:', cloudName || 'NOT SET');
  // console.log('API Key:', apiKey ? `${apiKey.substring(0, 6)}...` : 'NOT SET');
  // console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 6)}...` : 'NOT SET');
  // console.log('==============================');

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary credentials missing - photo upload will not work');
    return false;
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  // Create storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'employee-safety/profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: (req, file) => {
        return `employee-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      },
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    }
  });

  // Create multer upload
  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

  isConfigured = true;
  console.log('✅ Cloudinary configured successfully');
  return true;
};

// Getter for upload (ensures it's configured)
export const getUpload = () => {
  if (!upload) {
    throw new Error('Cloudinary not configured. Call configureCloudinary() first.');
  }
  return upload;
};

// Test upload function
export const testCloudinaryUpload = async () => {
  try {
    console.log('🧪 Testing Cloudinary upload...');
    
    const result = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      {
        folder: 'employee-safety/test',
        public_id: `test-${Date.now()}`
      }
    );
    
    console.log('✅ Cloudinary test upload successful!');
    console.log('   URL:', result.secure_url);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary test upload failed:', error.message);
    throw error;
  }
};

export { cloudinary };
export default cloudinary;