# ESP32-CAM Integration with SADS

This guide explains how to integrate your ESP32-CAM with the SADS (Smart Animal Detection System) project.

## Prerequisites

1. **ESP32-CAM Module** (AI Thinker ESP32-CAM)
2. **Arduino IDE** with ESP32 board support
3. **SADS Backend** running and accessible
4. **Device registered** in SADS system

## Step 1: Install Required Libraries

In Arduino IDE, install these libraries via Library Manager:

1. **ArduinoJson** by Benoit Blanchon (v6.x)
2. **base64** by Densaugeo (for base64 encoding)

## Step 2: Register Device in SADS

Before uploading code to ESP32, you need to register the device in SADS:

1. **Login to SADS** as Admin or Manager
2. **Navigate to Device Management** (or use API)
3. **Register a new device** with:
   - Serial Number: `ESP32-CAM-001` (or your custom serial)
   - Type: `camera`
   - Assigned Property: Select a property
   - Location: (Optional) GPS coordinates

### Using API (Alternative):

```bash
POST http://localhost:5000/api/devices
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "serialNumber": "ESP32-CAM-001",
  "type": "camera",
  "assignedProperty": "PROPERTY_ID",
  "location": {
    "latitude": 0.0,
    "longitude": 0.0
  }
}
```

## Step 3: Configure ESP32 Code

Edit `esp32_sads_integration.ino` and update these values:

```cpp
// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// SADS Backend Configuration
const char* SADS_SERVER = "http://YOUR_SERVER_IP:5000";  // Your SADS backend URL
const char* DEVICE_SERIAL = "ESP32-CAM-001";              // Must match registered serial

// Detection Interval (10 seconds)
const int DETECTION_INTERVAL = 10000;

// Buzzer Pin (adjust based on your wiring)
const int BUZZER_PIN = 4;  // GPIO 4
```

### Important Configuration Notes:

- **SADS_SERVER**: 
  - If running locally: `http://localhost:5000` won't work from ESP32
  - Use your computer's IP: `http://192.168.1.100:5000`
  - Or use a public URL if deployed: `https://your-sads-domain.com`

- **DEVICE_SERIAL**: Must exactly match the serial number you registered in SADS

## Step 4: Wire the Buzzer (Optional)

If you want buzzer functionality:

1. Connect buzzer positive to GPIO 4 (or your chosen pin)
2. Connect buzzer negative to GND
3. Use a transistor if buzzer requires more current

**Note**: You can remove buzzer code if not needed.

## Step 5: Upload Code

1. **Select Board**: Tools → Board → ESP32 → AI Thinker ESP32-CAM
2. **Select Port**: Tools → Port → (Your COM port)
3. **Upload** the code
4. **Open Serial Monitor** (115200 baud) to see logs

## Step 6: Verify Integration

### Check Serial Monitor:

You should see:
```
=== SADS ESP32-CAM Integration ===
Camera initialized successfully
Connecting to WiFi...
WiFi connected!
IP address: 10.190.173.44
Device Serial: ESP32-CAM-001
SADS Server: http://YOUR_SERVER:5000
Setup complete. Starting detection loop...
```

### Check SADS Backend:

1. **Device Status**: Should show as "online" in device management
2. **Detections**: Should appear in detection reports
3. **Notifications**: Should receive alerts for threat detections

## How It Works

### Detection Flow:

1. **Every 10 seconds**: ESP32 captures an image
2. **Image Processing**: Converts to base64
3. **Send to SADS**: POST to `/api/yolo/device-detect`
4. **YOLO Processing**: SADS sends image to YOLO API
5. **Threat Analysis**: Checks for threat animals
6. **Response**: Returns detection results
7. **Buzzer Activation**: If threat detected, activates buzzer

### Heartbeat:

- **Every 30 seconds**: Sends heartbeat to keep device online
- Updates device status, battery level, signal strength

### Threat Detection:

The system detects these animals as threats (configurable in backend):
- Elephant
- Tiger
- Wild Boar
- Deer
- Bear
- Wolf

**Threat Levels**:
- **Critical**: Confidence ≥ 80%
- **High**: Confidence ≥ 60%
- **Medium**: Confidence ≥ 50%

## Troubleshooting

### WiFi Connection Issues:

```
WiFi connection failed!
```

**Solutions**:
- Check SSID and password
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Check signal strength

### Camera Initialization Failed:

```
Camera init failed with error 0x...
```

**Solutions**:
- Check camera wiring
- Verify pin definitions match your board
- Try different frame size (QVGA instead of VGA)

### Detection Request Failed:

```
Detection request failed: -1
```

**Solutions**:
- Check SADS_SERVER URL is correct
- Verify backend is running
- Check device is registered with correct serial number
- Verify network connectivity from ESP32 to server

### Device Not Found:

```
Device not found
```

**Solutions**:
- Ensure device is registered in SADS
- Verify DEVICE_SERIAL matches exactly
- Check device registration in database

## API Endpoints Used

### 1. Heartbeat Endpoint:
```
POST /api/devices/heartbeat
Headers: Content-Type: application/json
Body: {
  "serialNumber": "ESP32-CAM-001",
  "batteryLevel": 100,
  "signalStrength": 85
}
```

### 2. Detection Endpoint:
```
POST /api/yolo/device-detect
Headers: 
  Content-Type: application/json
  X-Device-Serial: ESP32-CAM-001
Body: {
  "image": "base64_encoded_image_string",
  "confidence": 0.5
}
```

Response:
```json
{
  "success": true,
  "threatDetected": true,
  "threatLevel": "critical",
  "shouldActivateDeterrent": true,
  "total_detections": 1,
  "detections": [
    {
      "name": "elephant",
      "confidence": 85.5,
      "bbox": [x, y, width, height]
    }
  ]
}
```

## Customization

### Change Detection Interval:

```cpp
const int DETECTION_INTERVAL = 5000; // 5 seconds
```

### Change Image Quality:

```cpp
config.jpeg_quality = 8; // Lower = higher quality (0-63)
```

### Change Frame Size:

```cpp
config.frame_size = FRAMESIZE_QQVGA; // 160x120 (smaller, faster)
config.frame_size = FRAMESIZE_QVGA;  // 320x240
config.frame_size = FRAMESIZE_VGA;   // 640x480 (default)
```

### Add More Threat Animals:

Edit `backend/controllers/yolocontroller.js`:

```javascript
const threatAnimals = ['elephant', 'tiger', 'wild boar', 'deer', 'bear', 'wolf', 'your_animal'];
```

## Security Notes

1. **Device Authentication**: Uses serial number for authentication
2. **Network Security**: Consider using HTTPS in production
3. **API Keys**: Future versions may use API keys instead of serial numbers

## Next Steps

1. **Multiple Cameras**: Register multiple ESP32-CAMs with different serial numbers
2. **Advanced Deterrents**: Add lights, water spray, etc.
3. **Battery Monitoring**: Add battery level monitoring for battery-powered setups
4. **GPS Integration**: Add GPS module for location tracking

## Support

For issues or questions:
1. Check Serial Monitor for error messages
2. Verify backend logs
3. Check device registration in SADS dashboard
4. Review API responses in Serial Monitor







