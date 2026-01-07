const mongoose = require('mongoose');

const managerProfileSchema = new mongoose.Schema({
  Manager_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalDetections: {
    type: Number,
    default: 0,
    index: true
  },
  totalProperties: {
    type: Number,
    default: 0
  },
  totalCameras: {
    type: Number,
    default: 0
  },
  totalAlertsSent: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0 // in seconds
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  totalLoginCount: {
    type: Number,
    default: 0
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  performanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    index: true
  },
  achievements: [{
    type: String
  }],
  totalUptime: {
    type: Number,
    default: 0 // percentage
  },
  mostDetectedAnimal: {
    type: String,
    default: null
  },
  averageConfidence: {
    type: Number,
    default: 0 // percentage
  }
}, {
  timestamps: true
});

// Calculate performance score based on various metrics
managerProfileSchema.methods.calculatePerformanceScore = function() {
  let score = 0;
  
  // Response time component (max 30 points) - lower is better
  // Assuming 0-10 minutes is excellent (30 points), 10-20 is good (20 points), etc.
  if (this.averageResponseTime <= 300) { // 5 minutes
    score += 30;
  } else if (this.averageResponseTime <= 600) { // 10 minutes
    score += 20;
  } else if (this.averageResponseTime <= 1200) { // 20 minutes
    score += 10;
  }
  
  // Uptime component (max 30 points)
  score += (this.totalUptime / 100) * 30;
  
  // Detection accuracy component (max 25 points)
  score += (this.averageConfidence / 100) * 25;
  
  // Activity component (max 15 points) - based on login count and recent activity
  if (this.totalLoginCount > 100) {
    score += 15;
  } else if (this.totalLoginCount > 50) {
    score += 10;
  } else if (this.totalLoginCount > 20) {
    score += 5;
  }
  
  this.performanceScore = Math.min(100, Math.round(score));
  return this.performanceScore;
};

// Auto-create profile when manager is created (via post-save hook in User model would be ideal)
// For now, we'll create it manually in the controller

module.exports = mongoose.model('ManagerProfile', managerProfileSchema);





