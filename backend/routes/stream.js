/**
 * Stream Proxy Routes
 * Proxies MJPEG streams from ESP32 cameras to frontend
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { proxyStream } = require('../controllers/streamController');
const { checkStreamHealth, diagnoseStreamIssue } = require('../utils/streamHealth');

// Proxy MJPEG stream from ESP32 camera
// GET /api/stream/proxy?streamUrl=http://10.82.225.44/stream
// Note: Stream proxy works without auth requirement for better compatibility
// The frontend will send auth token if available, but it's not required for streams
router.get('/proxy', proxyStream);

// Test endpoint to check stream connectivity (no auth for testing)
router.get('/test', async (req, res) => {
  const { streamUrl } = req.query;
  if (!streamUrl) {
    return res.status(400).json({ error: 'streamUrl parameter required' });
  }
  
  const decodedUrl = decodeURIComponent(streamUrl);
  const healthResult = await checkStreamHealth(decodedUrl);
  const diagnosis = diagnoseStreamIssue(healthResult, decodedUrl);
  
  if (healthResult.healthy) {
    res.json({
      success: true,
      status: healthResult.status,
      contentType: healthResult.contentType,
      message: 'Stream is reachable and healthy',
      diagnosis
    });
  } else {
    res.status(503).json({
      success: false,
      error: healthResult.error?.message || 'Stream is not reachable',
      code: healthResult.error?.code,
      message: 'Cannot reach stream',
      diagnosis
    });
  }
});

// Health check endpoint for ESP32 streams
router.get('/health', authRequired, async (req, res) => {
  const { streamUrl } = req.query;
  if (!streamUrl) {
    return res.status(400).json({ error: 'streamUrl parameter required' });
  }
  
  const decodedUrl = decodeURIComponent(streamUrl);
  const healthResult = await checkStreamHealth(decodedUrl);
  const diagnosis = diagnoseStreamIssue(healthResult, decodedUrl);
  
  res.json({
    healthy: healthResult.healthy,
    reachable: healthResult.reachable,
    status: healthResult.status,
    error: healthResult.error,
    diagnosis
  });
});

module.exports = router;


