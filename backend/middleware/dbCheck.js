const mongoose = require('mongoose');

/**
 * Middleware to check if MongoDB is connected before processing requests
 * Allows operations if connecting (Mongoose will buffer them)
 * Only blocks if truly disconnected
 */
const checkDatabaseConnection = (req, res, next) => {
  const state = mongoose.connection.readyState;
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  // Allow if connected or connecting (Mongoose buffers operations when connecting)
  if (state === 1 || state === 2) {
    return next();
  }
  
  // Only block if truly disconnected
  if (state === 0) {
    console.warn(`⚠️  Database disconnected for ${req.method} ${req.path}`);
    return res.status(503).json({
      message: 'Database connection unavailable',
      error: 'Database is disconnected. Please check your MongoDB connection and try again.',
      state: 'disconnected'
    });
  }
  
  // For disconnecting state, allow but log warning
  if (state === 3) {
    console.warn(`⚠️  Database disconnecting for ${req.method} ${req.path}`);
  }
  
  next();
};

module.exports = checkDatabaseConnection;

