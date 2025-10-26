const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  cameraCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plantation: {
    name: { type: String, trim: true },
    location: { type: String, trim: true },
    fields: [{ type: String }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  settings: {
    detectionSensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    deterrentTypes: {
      sound: { type: Boolean, default: true },
      light: { type: Boolean, default: true },
      water: { type: Boolean, default: false }
    },
    activeHours: {
      start: { type: String, default: '06:00' },
      end: { type: String, default: '22:00' }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
propertySchema.index({ managerId: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ isActive: 1 });

module.exports = mongoose.model('Property', propertySchema);

