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
const YOLO_ENABLED = process.env.YOLO_ENABLED === 'true';

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

    // Save high-confidence YOLO detections to database
    if (yoloResult.elephant_count > 0 || yoloResult.tiger_count > 0) {
      const animalDetections = yoloResult.detections.filter(d => 
        d.name.toLowerCase().includes('elephant') || 
        d.name.toLowerCase().includes('tiger') ||
        d.name.toLowerCase().includes('cat')
      );

      for (const detection of animalDetections) {
        const newDetection = await Detection.create({
          userId: req.user.id,
          label: detection.name,
          confidence: detection.confidence,
          source: 'yolo-api',
          detectedAt: new Date(),
          metadata: {
            bbox: detection.bbox,
            class_id: detection.class_id,
            verification: 'yolo-verified'
          }
        });

        console.log(`Saved YOLO detection: ${detection.name} (${detection.confidence}%)`);

        // Send notification for high-confidence detections
        if (detection.confidence >= 70) {
          try {
            // Create notification documents
            const Notification = require('../models/notification');
            const User = require('../models/user');
            
            const animalType = detection.name.toUpperCase();
            const confidence = Math.round(detection.confidence);
            const notificationTitle = `🚨 ${animalType} Detected (YOLO)`;
            const notificationMessage = `${animalType} detected with ${confidence}% confidence via YOLO verification.`;
            
            // Create notification for the user
            await Notification.create({
              recipientId: req.user.id,
              senderId: req.user.id,
              title: notificationTitle,
              message: notificationMessage,
              type: 'detection',
              priority: confidence >= 80 ? 'critical' : 'high',
              relatedDetectionId: newDetection._id
            });
            
            // Create notifications for admins
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
              await Notification.create({
                recipientId: admin._id,
                senderId: req.user.id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'detection',
                priority: confidence >= 80 ? 'critical' : 'high',
                relatedDetectionId: newDetection._id
              });
            }
            
            // Send email notification
            await notifyAnimalDetection(req.user, detection.name, detection.confidence);
          } catch (emailError) {
            console.error('Failed to send YOLO detection notification:', emailError);
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






