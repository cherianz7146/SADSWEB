const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  label: { type: String, required: true, index: true },
  probability: { type: Number, required: true },
  source: { type: String, enum: ['video', 'image'], default: 'video' },
  detectedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Detection', detectionSchema);







