const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Sender of the notification (admin)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Type of notification
  type: {
    type: String,
    enum: ['admin', 'system', 'alert', 'info'],
    default: 'admin'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // When it was read
  readAt: {
    type: Date
  },
  
  // Whether email was sent
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, read: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);



