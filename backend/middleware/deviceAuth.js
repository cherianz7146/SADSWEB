/**
 * Device Authentication Middleware
 * Authenticates devices using serial number
 * Devices must be registered in the system
 */

const Device = require('../models/device');

const deviceAuth = async (req, res, next) => {
  try {
    const serialNumber = req.headers['x-device-serial'] || req.body.serialNumber;

    if (!serialNumber) {
      return res.status(401).json({ 
        message: 'Device serial number required',
        error: 'Missing X-Device-Serial header or serialNumber in body'
      });
    }

    // Find device by serial number
    const device = await Device.findOne({ serialNumber });

    if (!device) {
      return res.status(404).json({ 
        message: 'Device not found',
        error: `Device with serial number ${serialNumber} is not registered`
      });
    }

    // Check if device is active
    if (device.status === 'offline') {
      // Update status to online if device is sending requests
      device.status = 'online';
      device.lastPing = new Date();
      await device.save();
    }

    // Attach device to request
    req.device = device;
    next();
  } catch (error) {
    console.error('Device authentication error:', error);
    res.status(500).json({ 
      message: 'Device authentication failed',
      error: error.message 
    });
  }
};

module.exports = deviceAuth;





