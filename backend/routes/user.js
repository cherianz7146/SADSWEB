const express = require('express');
const router = express.Router();
const { listUsers, createUser, seedUsers } = require('../controllers/usercontroller');
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

module.exports = router;
