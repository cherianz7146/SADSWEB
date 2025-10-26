const Detection = require('../models/detection');
const User = require('../models/user');

async function listDetections(req, res) {
  try {
    const { limit = 50 } = req.query;
    let query = {};
    
    // If user is a manager, show only their detections
    // If user is an admin, show all detections
    if (req.user.role === 'manager' || req.user.role === 'user') {
      query.userId = req.user.id;
    }
    
    const items = await Detection.find(query)
      .sort({ detectedAt: -1 })
      .limit(Number(limit))
      .populate('propertyId', 'name')
      .populate('userId', 'userId name email role');
    
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error listing detections:', err);
    res.status(500).json({ message: 'Failed to list detections', error: err.message });
  }
}

async function createDetection(req, res) {
  try {
    const { label, probability, source, detectedAt, propertyId, location } = req.body;
    if (!label || typeof probability !== 'number') {
      return res.status(400).json({ message: 'label and probability are required' });
    }
    
    // Get user information (simplified - no property required!)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Use user's plantation info or property info if available
    let propertyName = 'N/A';
    let propertyLocation = location || 'N/A';
    
    // Check if user has plantation info
    if (user.plantation && user.plantation.name) {
      propertyName = user.plantation.name;
      propertyLocation = user.plantation.location || propertyLocation;
    }
    
    // Override with property info if propertyId is provided
    if (propertyId) {
      const Property = require('../models/property');
      const prop = await Property.findById(propertyId);
      if (prop) {
        propertyName = prop.name;
        propertyLocation = prop.plantation?.location || prop.address || propertyLocation;
      }
    }
    
    // Create detection with user's userId
    const det = await Detection.create({ 
      userId: req.user.id, 
      propertyId, 
      label, 
      probability, 
      source: source || 'browser-camera', 
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
      location: propertyLocation,
      propertyName: propertyName
    });
    
    // Populate userId to get full user details
    await det.populate('userId', 'userId name email role');
    
    // Send notification about animal detection
    setImmediate(async () => {
      try {
        // Get all admins
        const admins = await User.find({ role: 'admin' });
        const Notification = require('../models/notification');
        
        // Create notification message
        const animalType = det.label.toUpperCase();
        const confidence = Math.round(det.probability * 100);
        const notificationTitle = `🚨 ${animalType} Detected`;
        const notificationMessage = `${animalType} detected at ${propertyName} with ${confidence}% confidence. Location: ${propertyLocation}`;
        
        // Create notification for the detecting user
        await Notification.create({
          recipientId: user._id,
          senderId: user._id, // Self-notification from detection
          title: notificationTitle,
          message: notificationMessage,
          type: 'detection',
          priority: probability >= 0.8 ? 'critical' : probability >= 0.6 ? 'high' : 'medium',
          relatedDetectionId: det._id
        });
        
        // Create notifications for all admins
        for (const admin of admins) {
          await Notification.create({
            recipientId: admin._id,
            senderId: user._id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'detection',
            priority: probability >= 0.8 ? 'critical' : probability >= 0.6 ? 'high' : 'medium',
            relatedDetectionId: det._id
          });
        }
        
        console.log(`✅ Notification documents created for detection ${det._id}`);
        
        // Send email notifications
        const { notifyAnimalDetection } = require('../services/emailservices');
        await notifyAnimalDetection(det, user, admins);
        
        // Send SMS/WhatsApp alerts based on severity
        const { sendSmartAlert } = require('../services/twilioservice');
        
        // Send alert to the detecting user (manager)
        if (user.phone && user.alertPreferences?.enableSMS) {
          try {
            await sendSmartAlert(det, user);
            console.log(`✅ SMS/WhatsApp alert sent to ${user.name}`);
          } catch (alertErr) {
            console.error(`Failed to send SMS alert to ${user.name}:`, alertErr);
          }
        }
        
        // Also send to all admins with phone numbers
        for (const admin of admins) {
          if (admin.phone && admin.alertPreferences?.enableSMS) {
            try {
              await sendSmartAlert(det, admin);
              console.log(`✅ SMS/WhatsApp alert sent to admin ${admin.name}`);
            } catch (alertErr) {
              console.error(`Failed to send SMS alert to admin ${admin.name}:`, alertErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to send animal detection notification:', err);
      }
    });
    
    res.status(201).json(det);
  } catch (err) {
    console.error('Error creating detection:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    res.status(500).json({ message: 'Failed to create detection', error: err.message });
  }
}

module.exports = { listDetections, createDetection };



