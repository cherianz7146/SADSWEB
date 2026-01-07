const express = require('express');
const router = express.Router();
const { listUsers, createUser, seedUsers, updateUser, deleteUser, updateSelf, getAdminAdditionalInfo, getAdminActivity } = require('../controllers/usercontroller');
const { createUserRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorhandler');
const { authRequired } = require('../middleware/auth');

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

router.get('/', authRequired, asyncHandler(listUsers));
router.post('/', authRequired, createUserRules(), asyncHandler(createUser));
router.post('/seed', authRequired, adminOnly, asyncHandler(seedUsers));

// New routes for updating and deleting users by ID (admin only)
router.put('/:id', authRequired, adminOnly, asyncHandler(updateUser));
router.delete('/:id', authRequired, adminOnly, asyncHandler(deleteUser));

// Manager self-update
router.put('/me/profile', authRequired, asyncHandler(updateSelf));

// Admin profile additional info and activity (admin only)
router.get('/me/additional-info', authRequired, adminOnly, asyncHandler(getAdminAdditionalInfo));
router.get('/me/activity', authRequired, adminOnly, asyncHandler(getAdminActivity));

module.exports = router;