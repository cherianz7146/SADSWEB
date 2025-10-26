const express = require('express');
const router = express.Router();
const { getAdminStats, getManagerStats, getDetectionReport } = require('../controllers/statscontroller');
const { authRequired } = require('../middleware/auth');

// All routes require authentication
router.use(authRequired);

// GET /api/stats/admin - Admin dashboard statistics
router.get('/admin', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, getAdminStats);

// GET /api/stats/manager - Manager dashboard statistics
router.get('/manager', (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Manager access required' });
  }
  next();
}, getManagerStats);

// GET /api/stats/detection-report - Detection report
router.get('/detection-report', getDetectionReport);

module.exports = router;

