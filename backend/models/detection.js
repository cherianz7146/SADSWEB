const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  label: { type: String, required: true, index: true },
  probability: { type: Number, required: true },
  source: { type: String, enum: ['video', 'image', 'browser-camera', 'webcam', 'esp32'], default: 'video' },
  detectedAt: { type: Date, default: Date.now, index: true },
  location: { type: String, trim: true },
  propertyName: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Detection', detectionSchema);