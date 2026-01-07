const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { port, corsOrigin, mongoUri } = require('./config/constants');
const { errorHandler } = require('./middleware/errorhandler');

const app = express();

// Trust proxy for accurate IP detection (important for device heartbeat)
app.set('trust proxy', true);

// Basic security headers
app.use(helmet());

// Enable CORS
app.use(cors({ origin: corsOrigin, credentials: true }));

// JSON parsing with increased limit for base64 image uploads
// Base64 encoding increases file size by ~33%, so 5MB image becomes ~6.7MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// ------------------------------
// Fix Cross-Origin-Opener-Policy
// ------------------------------
app.use((req, res, next) => {
  // Allows Google One Tap / popup OAuth to communicate via postMessage
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Optional: only set COEP if needed
  // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  next();
});

// Rate limiting - Stricter for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// General API rate limiting - More lenient for regular API usage
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs for general API routes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and auth routes (they have their own limiter)
    return req.path === '/api/health' || req.path.startsWith('/api/auth');
  }
});

// Apply rate limiting - auth routes first, then general API routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/', apiLimiter);

// Connect to MongoDB with proper options
// Enable buffering so operations queue while connecting
mongoose.set('bufferCommands', true);

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 30000, // Increased to 30s for initial connection
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 30000, // Increased to 30s for connection
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Reduced to 1 (don't require 5 connections)
  retryWrites: true,
  w: 'majority',
  bufferCommands: true // Explicitly enable buffering
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Please check:');
    console.error('   1. MongoDB URI is correct in .env file');
    console.error('   2. Internet connection is active');
    console.error('   3. MongoDB Atlas IP whitelist includes your IP');
    console.error('   4. MongoDB credentials are correct');
    console.warn('⚠️  Server will continue, but database operations may fail until connection is established');
    // Don't exit - let the server start but operations will fail gracefully
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  });

// ------------------------------
// Routes
// ------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/detections', require('./routes/detection'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/properties', require('./routes/property'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/plantations', require('./routes/plantation'));
app.use('/api/password', require('./routes/password'));
app.use('/api/yolo', require('./routes/yolo'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/manager-profiles', require('./routes/managerProfile'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use(errorHandler);

// Export app for testing
if (require.main !== module) {
  module.exports = app;
} else {
  // Start server only if run directly
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
