const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const {
    registerDevice,
    getPropertyDevices,
    updateHeartbeat,
    getDevice,
    updateDevice,
    updateDeviceIp,
    deleteDevice,
    getDeviceHealth
} = require('../controllers/deviceController');

// Public route for devices to ping (in real world, use API Key middleware)
router.post('/heartbeat', updateHeartbeat);

// Protected routes
router.use(authRequired);

router.post('/', [
    check('serialNumber', 'Serial number is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['camera', 'deterrent', 'sensor']),
    check('assignedProperty', 'Property ID is required').not().isEmpty()
], registerDevice);

router.get('/health', getDeviceHealth);
router.get('/property/:propertyId', getPropertyDevices);
router.get('/:id', getDevice);
router.put('/:id', updateDevice);
router.patch('/:id/ip', updateDeviceIp); // Update device IP address
router.delete('/:id', deleteDevice);

module.exports = router;
