const express = require('express');
const router = express.Router();
const {
  getAllManagerProfiles,
  getManagerProfile,
  getMyProfile,
  createManagerProfile,
  updateManagerProfile,
  deleteManagerProfile,
  refreshManagerProfile,
  syncAllManagers
} = require('../controllers/managerProfileController');
const { authRequired } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorhandler');

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

// Get current user's profile
router.get('/me', authRequired, asyncHandler(getMyProfile));

// Get all manager profiles (admin only)
router.get('/', authRequired, adminOnly, asyncHandler(getAllManagerProfiles));

// Get specific manager profile
router.get('/:id', authRequired, asyncHandler(getManagerProfile));

// Create manager profile (admin only)
router.post('/', authRequired, adminOnly, asyncHandler(createManagerProfile));

// Update manager profile (admin only)
router.put('/:id', authRequired, adminOnly, asyncHandler(updateManagerProfile));

// Delete manager profile (admin only)
router.delete('/:id', authRequired, adminOnly, asyncHandler(deleteManagerProfile));

// Refresh manager profile stats
router.post('/:id/refresh', authRequired, adminOnly, asyncHandler(refreshManagerProfile));

// Sync all managers to manager profiles
router.post('/sync-all', authRequired, adminOnly, asyncHandler(syncAllManagers));

module.exports = router;

