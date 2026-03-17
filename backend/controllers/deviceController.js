const Device = require('../models/device');
const Property = require('../models/property');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// @desc    Register a new device
// @route   POST /api/devices
// @access  Private (Manager/Admin)
const registerDevice = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { serialNumber, type, assignedProperty, location, metadata } = req.body;

    // Check if device already exists
    const deviceExists = await Device.findOne({ serialNumber });
    if (deviceExists) {
        return res.status(400).json({ message: 'Device with this serial number already exists' });
    }

    // Verify property exists
    const property = await Property.findById(assignedProperty);
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }

    const device = await Device.create({
        serialNumber,
        type,
        assignedProperty,
        location,
        metadata: metadata || {},
        status: 'offline' // Default status
    });

    res.status(201).json(device);
});

// @desc    Get all devices for a property
// @route   GET /api/devices/property/:propertyId
// @access  Private
const getPropertyDevices = asyncHandler(async (req, res) => {
    const devices = await Device.find({ assignedProperty: req.params.propertyId })
        .sort({ createdAt: -1 });
    res.json(devices);
});

// @desc    Device Heartbeat (Ping)
// @route   POST /api/devices/heartbeat
// @access  Public (Device API Key in future, currently open for MVP)
const updateHeartbeat = asyncHandler(async (req, res) => {
    const { serialNumber, batteryLevel, signalStrength, ipAddress, type } = req.body;

    if (!serialNumber) {
        return res.status(400).json({ message: 'Serial number required' });
    }

    let device = await Device.findOne({ serialNumber });

    // Auto-register device if it doesn't exist
    if (!device) {
        console.log(`📦 Auto-registering new device: ${serialNumber}`);
        
        // Find a default property (first property in database, or create a default one)
        let defaultProperty = await Property.findOne().sort({ createdAt: 1 });
        
        if (!defaultProperty) {
            // Create a default property if none exists
            defaultProperty = await Property.create({
                name: 'Default Property',
                address: 'Auto-created for device registration',
                status: 'active'
            });
            console.log('✅ Created default property for device registration');
        }

        // Determine device type from serial number or request
        let deviceType = type || 'camera';
        if (serialNumber.toLowerCase().includes('esp32') || serialNumber.toLowerCase().includes('cam')) {
            deviceType = 'camera';
        }

        // Extract IP address from request if not provided in body
        const deviceIp = ipAddress || req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const cleanIp = deviceIp ? deviceIp.replace(/^::ffff:/, '') : null;

        // Create device with metadata
        // signalStrength: Use provided value or default to -50 (moderate signal)
        // WiFi RSSI is negative: -30 (excellent) to -100 (poor)
        const defaultSignalStrength = -50;
        device = await Device.create({
            serialNumber,
            type: deviceType,
            assignedProperty: defaultProperty._id,
            status: 'online',
            batteryLevel: batteryLevel || 100,
            signalStrength: signalStrength !== undefined ? signalStrength : defaultSignalStrength,
            lastPing: Date.now(),
            metadata: cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1' ? {
                ipAddress: cleanIp,
                streamUrl: `http://${cleanIp}/stream`
            } : {}
        });

        console.log(`✅ Auto-registered device: ${serialNumber} (${deviceType}) assigned to ${defaultProperty.name}`);
    }

    // Extract IP address from request if not provided in body
    const deviceIp = ipAddress || req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    // Remove IPv6 prefix if present (::ffff:)
    const cleanIp = deviceIp ? deviceIp.replace(/^::ffff:/, '') : null;

    // Update device status
    device.lastPing = Date.now();
    device.status = 'online';
    device.batteryLevel = batteryLevel || device.batteryLevel;
    device.signalStrength = signalStrength || device.signalStrength;

    // Update IP address in metadata if provided or detected
    if (cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1') {
        if (!device.metadata) {
            device.metadata = {};
        }
        // Only update if IP has changed
        if (device.metadata.ipAddress !== cleanIp) {
            console.log(`📡 Updating IP for ${serialNumber}: ${device.metadata.ipAddress || 'N/A'} → ${cleanIp}`);
            device.metadata.ipAddress = cleanIp;
            device.metadata.streamUrl = `http://${cleanIp}/stream`;
            device.markModified('metadata');
        }
    }

    await device.save();

    res.json({ 
        message: 'Heartbeat received', 
        config: device.config,
        ipUpdated: cleanIp && device.metadata?.ipAddress === cleanIp
    });
});

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
const getDevice = asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id).populate('assignedProperty', 'name');
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
});

// @desc    Update device configuration
// @route   PUT /api/devices/:id
// @access  Private (Manager/Admin)
const updateDevice = asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id);

    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    const updatedDevice = await Device.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedDevice);
});

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only)
const deleteDevice = asyncHandler(async (req, res) => {
    const device = await Device.findById(req.params.id);

    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    await device.deleteOne();
    res.json({ message: 'Device removed' });
});

// @desc    Get device health statistics
// @route   GET /api/devices/health
// @access  Private
const getDeviceHealth = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // Get all properties for this user (if manager) or all properties (if admin)
    let propertyQuery = {};
    if (req.user.role === 'manager') {
        const properties = await Property.find({ managerId: userId }).select('_id');
        const propertyIds = properties.map(p => p._id);
        propertyQuery = { assignedProperty: { $in: propertyIds } };
    }
    
    // Get all devices
    const devices = await Device.find(propertyQuery)
        .populate('assignedProperty', 'name')
        .sort({ createdAt: -1 });
    
    const now = new Date();
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    
    devices.forEach(device => {
        const lastPing = new Date(device.lastPing);
        const minutesSincePing = (now.getTime() - lastPing.getTime()) / (1000 * 60);
        
        if (device.status === 'offline' || minutesSincePing > 30) {
            critical++;
        } else if (device.batteryLevel < 20 || device.signalStrength < 30 || minutesSincePing > 10) {
            warning++;
        } else {
            healthy++;
        }
    });
    
    const totalDevices = devices.length;
    const averageHealthScore = totalDevices > 0 
        ? Math.round(((healthy / totalDevices) * 100) + ((warning / totalDevices) * 50))
        : 0;
    
    res.json({
        totalDevices,
        healthy,
        warning,
        critical,
        averageHealthScore,
        devices: devices.map(device => ({
            _id: device._id,
            serialNumber: device.serialNumber,
            type: device.type,
            status: device.status,
            batteryLevel: device.batteryLevel,
            signalStrength: device.signalStrength,
            assignedProperty: device.assignedProperty && typeof device.assignedProperty === 'object' 
                ? { _id: device.assignedProperty._id, name: device.assignedProperty.name }
                : device.assignedProperty,
            lastPing: device.lastPing,
            metadata: device.metadata || {}
        }))
    });
});

// @desc    Update device IP address manually
// @route   PATCH /api/devices/:id/ip
// @access  Private (Admin)
const updateDeviceIp = asyncHandler(async (req, res) => {
    const { ipAddress } = req.body;

    if (!ipAddress) {
        return res.status(400).json({ message: 'IP address is required' });
    }

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
        return res.status(400).json({ message: 'Invalid IP address format' });
    }

    const device = await Device.findById(req.params.id);

    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    // Update metadata
    if (!device.metadata) {
        device.metadata = {};
    }
    const oldIp = device.metadata.ipAddress;
    device.metadata.ipAddress = ipAddress;
    device.metadata.streamUrl = `http://${ipAddress}/stream`;
    device.markModified('metadata');
    await device.save();

    console.log(`📡 IP updated for ${device.serialNumber}: ${oldIp || 'N/A'} → ${ipAddress}`);

    res.json({ 
        message: 'Device IP updated successfully',
        device: {
            _id: device._id,
            serialNumber: device.serialNumber,
            metadata: device.metadata
        }
    });
});

module.exports = {
    registerDevice,
    getPropertyDevices,
    updateHeartbeat,
    getDevice,
    updateDevice,
    updateDeviceIp,
    deleteDevice,
    getDeviceHealth
};
