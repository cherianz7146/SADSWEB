/**
 * YOLO API Integration Controller
 * Forwards detection requests to Flask YOLO API for high-accuracy verification
 */

const axios = require('axios');
const FormData = require('form-data');
const Detection = require('../models/detection');
const { notifyAnimalDetection } = require('../services/emailservices');

// YOLO API configuration
const YOLO_API_URL = process.env.YOLO_API_URL || 'http://localhost:5001';
// Enable YOLO by default (only disable if explicitly set to 'false')
const YOLO_ENABLED = process.env.YOLO_ENABLED !== 'false';

/**
 * Check if YOLO API is available
 */
exports.checkYoloHealth = async (req, res) => {
  try {
    const response = await axios.get(`${YOLO_API_URL}/health`, { timeout: 5000 });
    res.json({
      available: true,
      ...response.data
    });
  } catch (error) {
    res.json({
      available: false,
      error: error.message,
      message: 'YOLO API is not running'
    });
  }
};

/**
 * Verify a detection using YOLO API
 * Accepts base64 image from browser camera
 */
exports.verifyWithYolo = async (req, res) => {
  try {
    if (!YOLO_ENABLED) {
      return res.status(503).json({
        success: false,
        message: 'YOLO verification is disabled'
      });
    }

    const { image, confidence } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    console.log('Forwarding image to YOLO API for verification...');

    // Send to YOLO API
    const response = await axios.post(
      `${YOLO_API_URL}/detect/base64`,
      {
        image,
        conf: confidence || 0.5
      },
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const yoloResult = response.data;

    if (!yoloResult.success) {
      return res.status(500).json({
        success: false,
        message: 'YOLO detection failed',
        error: yoloResult.error
      });
    }

    // Save all animal detections to database (not just elephants and tigers)
    if (yoloResult.detections && yoloResult.detections.length > 0) {
      // Filter for animal detections (you can expand this list)
      const animalKeywords = ['elephant', 'tiger', 'cat', 'deer', 'boar', 'squirrel', 'raccoon', 'bear', 'leopard', 'lion', 'dog', 'cow', 'horse', 'bird'];
      const animalDetections = yoloResult.detections.filter(d => {
        const nameLower = (d.name || '').toLowerCase();
        return animalKeywords.some(keyword => nameLower.includes(keyword));
      });

      console.log(`Found ${animalDetections.length} animal detection(s) out of ${yoloResult.detections.length} total`);

      for (const detection of animalDetections) {
        const confidence = typeof detection.confidence === 'number' 
          ? detection.confidence 
          : parseFloat(detection.confidence) || 0;
        
        // Save all detections with confidence >= 30% (lower threshold for better detection)
        if (confidence >= 30) {
          const newDetection = await Detection.create({
            userId: req.user.id,
            label: detection.name,
            confidence: confidence,
            source: 'yolo-api',
            detectedAt: new Date(),
            metadata: {
              bbox: detection.bbox,
              class_id: detection.class_id,
              verification: 'yolo-verified'
            }
          });

          console.log(`✅ Saved YOLO detection: ${detection.name} (${confidence}%)`);

          // Send notification for all saved detections
          try {
            // Create notification documents
            const Notification = require('../models/notification');
            const User = require('../models/user');
            
            const animalType = detection.name.toUpperCase();
            const confidenceRounded = Math.round(confidence);
            const notificationTitle = `🚨 ${animalType} Detected (ESP32 Camera)`;
            const notificationMessage = `${animalType} detected with ${confidenceRounded}% confidence via ESP32 camera feed.`;
            
            console.log(`📢 Creating notification: ${notificationTitle}`);
            
            // Create notification for the user
            await Notification.create({
              recipientId: req.user.id,
              senderId: req.user.id,
              title: notificationTitle,
              message: notificationMessage,
              type: 'detection',
              priority: confidence >= 80 ? 'critical' : confidence >= 60 ? 'high' : 'medium',
              relatedDetectionId: newDetection._id
            });
            
            console.log(`✅ Notification created for user: ${req.user.id}`);
            
            // Create notifications for all admins
            const admins = await User.find({ role: 'admin' });
            console.log(`📢 Creating notifications for ${admins.length} admin(s)`);
            
            for (const admin of admins) {
              // Don't duplicate notification if user is already an admin
              if (admin._id.toString() !== req.user.id) {
                await Notification.create({
                  recipientId: admin._id,
                  senderId: req.user.id,
                  title: notificationTitle,
                  message: notificationMessage,
                  type: 'detection',
                  priority: confidence >= 80 ? 'critical' : confidence >= 60 ? 'high' : 'medium',
                  relatedDetectionId: newDetection._id
                });
              }
            }
            
            console.log(`✅ Notifications created for all admins`);
            
            // Send email notification
            try {
              await notifyAnimalDetection(req.user, detection.name, confidence);
              console.log(`✅ Email notification sent`);
            } catch (emailError) {
              console.error('⚠️ Failed to send email notification:', emailError.message);
            }
          } catch (notifError) {
            console.error('❌ Failed to create notifications:', notifError);
          }
        }
      }
    }

    res.json({
      success: true,
      source: 'yolo-api',
      ...yoloResult
    });

  } catch (error) {
    console.error('YOLO verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify with YOLO API',
      error: error.message,
      yolo_available: false
    });
  }
};

/**
 * Upload image file for YOLO detection
 * Used for stored images or screenshots
 */
exports.detectFromFile = async (req, res) => {
  try {
    if (!YOLO_ENABLED) {
      return res.status(503).json({
        success: false,
        message: 'YOLO detection is disabled'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(`Processing uploaded file: ${req.file.originalname}`);

    // Create form data for YOLO API
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward to YOLO API
    const response = await axios.post(
      `${YOLO_API_URL}/detect`,
      formData,
      {
        timeout: 30000,
        headers: formData.getHeaders()
      }
    );

    const yoloResult = response.data;

    if (!yoloResult.success) {
      return res.status(500).json({
        success: false,
        message: 'YOLO detection failed',
        error: yoloResult.error
      });
    }

    // Save detections
    if (yoloResult.total_detections > 0) {
      for (const detection of yoloResult.animal_detections) {
        await Detection.create({
          userId: req.user.id,
          label: detection.name,
          confidence: detection.confidence,
          source: 'yolo-file-upload',
          detectedAt: new Date(),
          metadata: {
            bbox: detection.bbox,
            class_id: detection.class_id,
            original_filename: req.file.originalname
          }
        });

        if (detection.confidence >= 70) {
          try {
            await notifyAnimalDetection(req.user, detection.name, detection.confidence);
          } catch (emailError) {
            console.error('Failed to send notification:', emailError);
          }
        }
      }
    }

    res.json({
      success: true,
      source: 'yolo-file-upload',
      filename: req.file.originalname,
      ...yoloResult
    });

  } catch (error) {
    console.error('File detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: error.message
    });
  }
};

/**
 * Get YOLO API statistics
 */
exports.getYoloStats = async (req, res) => {
  try {
    const response = await axios.get(`${YOLO_API_URL}/stats`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get YOLO stats',
      message: error.message
    });
  }
};

/**
 * Device detection endpoint for ESP32 cameras
 * Accepts base64 image from IoT devices
 * Uses device authentication via serial number
 */
exports.detectFromDevice = async (req, res) => {
  try {
    if (!YOLO_ENABLED) {
      return res.status(503).json({
        success: false,
        message: 'YOLO detection is disabled'
      });
    }

    const { image, confidence } = req.body;
    const device = req.device; // From deviceAuth middleware

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    console.log(`Device ${device.serialNumber} sending image for detection...`);

    // Send to YOLO API
    const response = await axios.post(
      `${YOLO_API_URL}/detect/base64`,
      {
        image,
        conf: confidence || 0.5
      },
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const yoloResult = response.data;

    if (!yoloResult.success) {
      return res.status(500).json({
        success: false,
        message: 'YOLO detection failed',
        error: yoloResult.error
      });
    }

    // Get property and manager info from device
    const Property = require('../models/property');
    const property = await Property.findById(device.assignedProperty).populate('managerId', 'name email _id');
    
    // Threat animals list (customize based on your needs)
    const threatAnimals = ['elephant', 'tiger', 'wild boar', 'deer', 'bear', 'wolf'];
    let threatDetected = false;
    let threatLevel = 'none';

    // Check for threat animals
    if (yoloResult.detections && yoloResult.detections.length > 0) {
      for (const detection of yoloResult.detections) {
        const animalName = detection.name.toLowerCase();
        const isThreat = threatAnimals.some(threat => animalName.includes(threat));
        
        if (isThreat && detection.confidence >= 50) {
          threatDetected = true;
          if (detection.confidence >= 80) {
            threatLevel = 'critical';
          } else if (detection.confidence >= 60) {
            threatLevel = 'high';
          } else {
            threatLevel = 'medium';
          }
          break;
        }
      }
    }

    // Save detections to database
    if (yoloResult.total_detections > 0 && property && property.managerId) {
      for (const detection of yoloResult.detections) {
        await Detection.create({
          userId: property.managerId._id,
          propertyId: property._id,
          label: detection.name,
          confidence: detection.confidence,
          source: `esp32-${device.serialNumber}`,
          detectedAt: new Date(),
          metadata: {
            bbox: detection.bbox,
            class_id: detection.class_id,
            deviceSerial: device.serialNumber,
            deviceId: device._id.toString(),
            threatDetected: threatDetected,
            threatLevel: threatLevel
          }
        });
      }

      // Send notifications for high-confidence detections
      if (yoloResult.detections.some(d => d.confidence >= 70)) {
        try {
          const Notification = require('../models/notification');
          const User = require('../models/user');
          
          const highConfidenceDetections = yoloResult.detections.filter(d => d.confidence >= 70);
          const animalType = highConfidenceDetections[0].name.toUpperCase();
          const confidence = Math.round(highConfidenceDetections[0].confidence);
          
          const notificationTitle = `🚨 ${animalType} Detected (ESP32-${device.serialNumber})`;
          const notificationMessage = `${animalType} detected with ${confidence}% confidence at ${property.name}.`;
          
          // Notify property manager
          await Notification.create({
            recipientId: property.managerId._id,
            senderId: property.managerId._id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'detection',
            priority: threatLevel === 'critical' ? 'critical' : 'high',
            relatedDetectionId: null
          });
          
          // Notify admins
          const admins = await User.find({ role: 'admin' });
          for (const admin of admins) {
            await Notification.create({
              recipientId: admin._id,
              senderId: property.managerId._id,
              title: notificationTitle,
              message: notificationMessage,
              type: 'detection',
              priority: threatLevel === 'critical' ? 'critical' : 'high',
              relatedDetectionId: null
            });
          }
          
          // Send email notification
          if (property.managerId) {
            await notifyAnimalDetection(property.managerId, animalType, confidence);
          }
        } catch (notifError) {
          console.error('Failed to send device detection notification:', notifError);
        }
      }
    }

    // Update device last ping
    device.lastPing = new Date();
    device.status = 'online';
    await device.save();

    res.json({
      success: true,
      source: `esp32-${device.serialNumber}`,
      threatDetected: threatDetected,
      threatLevel: threatLevel,
      shouldActivateDeterrent: threatDetected && threatLevel !== 'none',
      ...yoloResult
    });

  } catch (error) {
    console.error('Device detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process device detection',
      error: error.message,
      yolo_available: false
    });
  }
};






