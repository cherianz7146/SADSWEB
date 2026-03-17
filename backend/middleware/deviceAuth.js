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
    let device = await Device.findOne({ serialNumber });

    if (!device) {
      // Auto-register device if it doesn't exist (same logic as heartbeat)
      console.log(`📦 Auto-registering device from detection request: ${serialNumber}`);
      const Property = require('../models/property');
      let defaultProperty = await Property.findOne().sort({ createdAt: 1 });
      
      if (!defaultProperty) {
        defaultProperty = await Property.create({
          name: 'Default Property',
          address: 'Auto-created for device registration',
          status: 'active'
        });
      }

      const deviceType = serialNumber.toLowerCase().includes('esp32') || serialNumber.toLowerCase().includes('cam') 
        ? 'camera' 
        : 'camera';

      device = await Device.create({
        serialNumber,
        type: deviceType,
        assignedProperty: defaultProperty._id,
        status: 'online',
        batteryLevel: 100,
        signalStrength: -50, // Default moderate signal
        lastPing: new Date()
      });

      console.log(`✅ Auto-registered device: ${serialNumber} (${deviceType})`);
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






