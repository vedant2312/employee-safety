import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  scannedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  scannedBy: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  sosStatus: {
    type: String,
    enum: ['sent', 'failed', 'acknowledged'],
    default: 'sent'
  },
  
  acknowledgments: [{
    contactName: String,
    acknowledgedAt: Date,
    message: String
  }],
  
  notes: {
    type: String,
    trim: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;