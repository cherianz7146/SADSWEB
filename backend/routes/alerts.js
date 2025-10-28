const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const alertController = require('../controllers/alertcontroller');

// Get current user's alert settings
router.get('/settings', authRequired, alertController.getSettings);

// Update phone number
router.patch('/phone', authRequired, alertController.updatePhone);

// Update alert preferences
router.patch('/preferences', authRequired, alertController.updatePreferences);

// Send test alert
router.post('/test', authRequired, alertController.sendTest);

// Admin: Send custom alert to managers
router.post('/custom', authRequired, alertController.sendCustomAlert);

module.exports = router;




