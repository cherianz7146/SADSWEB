const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['camera', 'deterrent', 'sensor'],
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  lastPing: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  signalStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  assignedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  config: {
    sensitivity: { type: String, default: 'medium' },
    activeHours: { type: String, default: '24/7' }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for IP address, stream URL, etc.
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
deviceSchema.index({ assignedProperty: 1 });
deviceSchema.index({ status: 1 });
// Note: serialNumber index is automatically created by unique: true, so no need to add it explicitly

module.exports = mongoose.model('Device', deviceSchema);
