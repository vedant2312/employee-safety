import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  settings: {
    sosCascade: {
      type: Boolean,
      default: true
    },
    requirePhotoUpdate: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;