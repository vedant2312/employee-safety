import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  department: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String, // URL to photo
    default: ''
  },
  
  // Medical Information
  medicalInfo: {
    critical: {
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
      },
      allergies: [{
        type: String,
        trim: true
      }],
      chronicConditions: [{
        type: String,
        trim: true
      }]
    },
    important: {
      currentMedications: [{
        type: String,
        trim: true
      }],
      recentSurgeries: [{
        type: String,
        trim: true
      }]
    },
    context: {
      insuranceDetails: {
        type: String,
        trim: true
      },
      doctorContact: {
        type: String,
        trim: true
      }
    }
  },

  // Emergency Contacts
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: Number,
      default: 1
    }
  }],

  // QR Code
  qrToken: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  qrGeneratedAt: {
    type: Date
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique employeeId per organization
employeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;