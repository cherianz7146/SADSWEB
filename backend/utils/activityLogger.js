const ActivityLog = require('../models/activityLog');

/**
 * Log an activity for a user (non-blocking)
 * @param {String} userId - The user ID who performed the action
 * @param {String} action - The action type (e.g., 'user_created', 'property_updated')
 * @param {String} description - Human-readable description
 * @param {Object} metadata - Additional data about the action
 * @param {String} ipAddress - Optional IP address
 */
async function logActivity(userId, action, description, metadata = {}, ipAddress = null) {
  try {
    const activity = new ActivityLog({
      userId,
      action,
      description,
      metadata,
      ipAddress
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    // Non-blocking: log error but don't throw
    console.error('Failed to log activity:', error);
    return null;
  }
}

/**
 * Get IP address from request object
 * @param {Object} req - Express request object
 * @returns {String|null} - IP address or null
 */
function getIpAddress(req) {
  if (!req) return null;
  
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
         null;
}

module.exports = {
  logActivity,
  getIpAddress
};







