/**
 * YOLO API Routes
 * Routes for high-accuracy detection verification using YOLO
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const {
  checkYoloHealth,
  verifyWithYolo,
  detectFromFile,
  getYoloStats
} = require('../controllers/yolocontroller');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Health check - check if YOLO API is running
router.get('/health', checkYoloHealth);

// Verify detection with YOLO (accepts base64 image)
router.post('/verify', authRequired, verifyWithYolo);

// Detect from uploaded file
router.post('/detect-file', authRequired, upload.single('image'), detectFromFile);

// Get YOLO API statistics
router.get('/stats', authRequired, getYoloStats);

module.exports = router;







