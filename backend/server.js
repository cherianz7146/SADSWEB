const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { port, corsOrigin, mongoUri } = require('./config/constants');
const { errorHandler } = require('./middleware/errorhandler');

const app = express();

// Basic security headers
app.use(helmet());

// Enable CORS
app.use(cors({ origin: corsOrigin, credentials: true }));

// JSON parsing
app.use(express.json());

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

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
