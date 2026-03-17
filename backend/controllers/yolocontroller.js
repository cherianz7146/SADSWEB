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
    console.log(`   YOLO API URL: ${YOLO_API_URL}/detect/base64`);

    // Send to YOLO API
    // Use lower default confidence (0.25 = 25%) for better detection
    let response;
    try {
      response = await axios.post(
        `${YOLO_API_URL}/detect/base64`,
        {
          image,
          conf: confidence || 0.25  // Lowered to 0.25 for better detection accuracy
        },
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (axiosError) {
      // Re-throw with better error info for the outer catch block
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        throw new Error('YOLO API connection refused or timed out');
      }
      throw axiosError;
    }

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
        let confidence = typeof detection.confidence === 'number' 
          ? detection.confidence 
          : parseFloat(detection.confidence) || 0;
        
        // Handle confidence format: could be 0-100 (percentage) or 0-1 (decimal)
        // Convert to percentage if it's decimal
        if (confidence <= 1) {
          confidence = confidence * 100;
        }
        
        // Save all detections with confidence >= 30% (lowered for classification model)
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
    
    // Check if it's a connection error (YOLO API not running)
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        message: 'YOLO API is not available. Please start the YOLO service.',
        error: 'YOLO API connection refused',
        yolo_available: false,
        instructions: [
          '1. Open a terminal/command prompt',
          '2. Navigate to the project directory: cd D:\\SADS2',
          '3. Start the service: cd ml && python yolo_api.py',
          '4. Wait for "Starting SADS YOLO API on port 5001" message',
          '5. Refresh this page'
        ]
      });
    }
    
    // Other errors
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

    console.log(`📸 Device ${device.serialNumber} sending image for detection...`);
    console.log(`   Image data length: ${image ? image.length : 0} characters`);
    console.log(`   Confidence threshold: ${confidence || 0.5}`);
    console.log(`   YOLO API URL: ${YOLO_API_URL}/detect/base64`);

    // Send to YOLO API with retry logic (handles YOLO API startup delay)
    let response;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        response = await axios.post(
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
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        if (error.code === 'ECONNREFUSED' && retries > 1) {
          // YOLO API not ready yet, wait and retry
          console.log(`⚠️  YOLO API not ready, retrying in 2 seconds... (${retries - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
        } else {
          // Other error or out of retries
          throw error;
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to connect to YOLO API after retries');
    }

    const yoloResult = response.data;

    console.log(`✅ YOLO API Response received:`);
    console.log(`   Success: ${yoloResult.success}`);
    console.log(`   Total detections: ${yoloResult.total_detections || 0}`);
    console.log(`   Detections array length: ${yoloResult.detections?.length || 0}`);
    if (yoloResult.detections && yoloResult.detections.length > 0) {
      console.log(`   First detection: ${yoloResult.detections[0].name} (${yoloResult.detections[0].confidence}%)`);
    } else {
      console.log(`   ⚠️ No detections found by YOLO`);
    }

    if (!yoloResult.success) {
      console.error(`❌ YOLO detection failed: ${yoloResult.error}`);
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
        
        // Increased threshold to 65% to reduce false positives (52-54% is too low)
        if (isThreat && detection.confidence >= 65) {
          threatDetected = true;
          if (detection.confidence >= 80) {
            threatLevel = 'critical';
          } else if (detection.confidence >= 70) {
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
          probability: detection.confidence / 100, // Convert percentage to 0-1 range
          source: 'esp32', // Use enum value instead of full string
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

/**
 * Detect from stream URL (proxy method to avoid CORS issues)
 * Fetches the image server-side and sends to YOLO
 */
exports.detectFromStreamUrl = async (req, res) => {
  try {
    if (!YOLO_ENABLED) {
      return res.status(503).json({
        success: false,
        message: 'YOLO verification is disabled'
      });
    }

    const { streamUrl, confidence } = req.body;

    if (!streamUrl) {
      return res.status(400).json({
        success: false,
        message: 'Stream URL is required'
      });
    }

    console.log(`Fetching image from stream URL: ${streamUrl}`);

    // For MJPEG streams, we need to read the stream and extract a single frame
    // MJPEG streams send frames continuously, so we read the first complete frame
    let imageBuffer;
    let contentType = 'image/jpeg';

    try {
      // Fetch the stream with stream response type
      // Use longer timeout and retry logic for ESP32 streams
      const streamResponse = await axios.get(streamUrl, {
        responseType: 'stream',
        timeout: 20000, // Increased timeout for ESP32
        headers: {
          'Accept': 'multipart/x-mixed-replace, image/jpeg, image/*',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        },
        httpAgent: new (require('http').Agent)({ 
          keepAlive: true, 
          keepAliveMsecs: 30000,
          timeout: 20000,
          family: 4 // Force IPv4
        }),
        httpsAgent: new (require('https').Agent)({ 
          keepAlive: true, 
          keepAliveMsecs: 30000,
          timeout: 20000,
          family: 4 // Force IPv4
        })
      });

      // Read the first frame from MJPEG stream
      // MJPEG format: --boundary\r\nContent-Type: image/jpeg\r\nContent-Length: <size>\r\n\r\n<image data>--boundary
      imageBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        let headerEndIndex = -1;
        let contentLength = null;
        let totalBytes = 0;
        let frameDataStart = -1;

        const timeout = setTimeout(() => {
          streamResponse.data.destroy();
          reject(new Error('Timeout waiting for image frame from stream'));
        }, 10000);

        streamResponse.data.on('data', (chunk) => {
          chunks.push(chunk);
          totalBytes += chunk.length;

          // Try to find the header end and content length
          if (headerEndIndex === -1) {
            const allData = Buffer.concat(chunks).toString('binary');
            
            // Find Content-Length header
            if (!contentLength) {
              const lengthMatch = allData.match(/Content-Length:\s*(\d+)/i);
              if (lengthMatch) {
                contentLength = parseInt(lengthMatch[1], 10);
              }
            }

            // Find where image data starts (after \r\n\r\n)
            if (allData.includes('\r\n\r\n')) {
              headerEndIndex = allData.indexOf('\r\n\r\n');
              frameDataStart = headerEndIndex + 4;
            }
          }

          // If we have the header info and enough data, extract the frame
          if (contentLength && frameDataStart >= 0) {
            const allData = Buffer.concat(chunks);
            const imageData = allData.slice(frameDataStart, frameDataStart + contentLength);
            
            if (imageData.length >= contentLength) {
              clearTimeout(timeout);
              streamResponse.data.destroy();
              resolve(imageData);
            }
          }
        });

        streamResponse.data.on('error', (error) => {
          clearTimeout(timeout);
          console.error('Stream read error:', error);
          reject(error);
        });

        streamResponse.data.on('end', () => {
          clearTimeout(timeout);
          // If we couldn't parse properly, try to use the data we have
          if (chunks.length > 0) {
            const allData = Buffer.concat(chunks);
            // Try to find JPEG start marker (FF D8)
            const jpegStart = allData.indexOf(Buffer.from([0xFF, 0xD8]));
            if (jpegStart >= 0) {
              // Find JPEG end marker (FF D9)
              const jpegEnd = allData.indexOf(Buffer.from([0xFF, 0xD9]), jpegStart);
              if (jpegEnd >= 0) {
                resolve(allData.slice(jpegStart, jpegEnd + 2));
              } else {
                resolve(allData.slice(jpegStart));
              }
            } else {
              resolve(allData);
            }
          } else {
            reject(new Error('No image data received from stream'));
          }
        });
      });

      console.log(`Image frame extracted (${imageBuffer.length} bytes), forwarding to YOLO API...`);

      // Validate image buffer
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Empty image buffer received from stream');
      }

      // Check for valid JPEG markers
      const jpegStart = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
      const jpegEnd = imageBuffer[imageBuffer.length - 2] === 0xFF && imageBuffer[imageBuffer.length - 1] === 0xD9;
      
      if (!jpegStart) {
        console.warn('⚠️ Image buffer does not start with JPEG marker (FF D8)');
      }
      if (!jpegEnd) {
        console.warn('⚠️ Image buffer does not end with JPEG marker (FF D9)');
      }

    } catch (streamError) {
      console.error('Error fetching MJPEG stream:', streamError.message);
      throw new Error(`Failed to fetch image from stream: ${streamError.message}`);
    }

    // Convert to base64
    const base64Image = `data:${contentType};base64,${imageBuffer.toString('base64')}`;

    console.log(`Image converted to base64 (${base64Image.length} chars), sending to YOLO API...`);

    // Send to YOLO API with the provided confidence threshold
    // Use lower default (0.25) for better detection with ESP32 image quality
    const confThreshold = confidence || 0.25;  // 25% threshold for better detection
    console.log(`Sending to YOLO API with confidence threshold: ${confThreshold}`);
    
    const yoloResponse = await axios.post(
      `${YOLO_API_URL}/detect/base64`,
      {
        image: base64Image,
        conf: confThreshold
      },
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const yoloResult = yoloResponse.data;

    if (!yoloResult.success) {
      console.error('❌ YOLO detection failed:', yoloResult.error);
      return res.status(500).json({
        success: false,
        message: 'YOLO detection failed',
        error: yoloResult.error
      });
    }

    // Log detection results for debugging
    console.log(`✅ YOLO detection successful:`);
    console.log(`   Total detections: ${yoloResult.total_detections || 0}`);
    console.log(`   Detections array length: ${yoloResult.detections?.length || 0}`);
    console.log(`   Animal detections: ${yoloResult.animal_detections?.length || 0}`);
    if (yoloResult.detections && yoloResult.detections.length > 0) {
      const firstDet = yoloResult.detections[0];
      console.log(`   First detection: ${firstDet.name} (${firstDet.confidence}%)`);
    }

    // Return the detection results - same format as verifyWithYolo for consistency
    res.json({
      success: true,
      source: 'stream-url-proxy',
      ...yoloResult  // Include all YOLO result fields (detections, total_detections, animal_detections, etc.)
    });

  } catch (error) {
    console.error('Stream URL detection error:', error);
    
    // Check if it's a YOLO API connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      return res.status(503).json({
        success: false,
        message: 'YOLO API is not available',
        error: 'Connection refused. Please ensure YOLO API is running on ' + (process.env.YOLO_API_URL || 'http://localhost:5001')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process stream detection',
      error: error.message
    });
  }
};






