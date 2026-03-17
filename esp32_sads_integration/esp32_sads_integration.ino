#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "base64.h"

// ===================
// AI Thinker ESP32-CAM Pin Map
// ===================
// NOTE: These pins are for AI Thinker ESP32-CAM
// If you have ESP32-S3 CAM LCD, use different pins (see comments below)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ===================
// Deterrent Pins
// ===================
#define BUZZER_PIN         13  // Buzzer pin (use GPIO 13 or any free pin)
#define LED_PIN            2   // Built-in LED
#define FLASH_LED_PIN      4   // Camera flash LED

// ===================
// WiFi Credentials
// ===================
const char* ssid = "SSD";
const char* password = "123456789";

// ===================
// Static IP Configuration
// ===================
IPAddress local_IP(10, 82, 225, 44);      // Static IP address
IPAddress gateway(10, 82, 225, 63);      // Router/Gateway IP
IPAddress subnet(255, 255, 255, 0);      // Subnet mask
IPAddress primaryDNS(8, 8, 8, 8);         // Primary DNS (Google DNS)
IPAddress secondaryDNS(8, 8, 4, 4);     // Secondary DNS (Google DNS)

// ===================
// SADS Backend Configuration
// ===================
const char* SADS_SERVER = "http://10.82.225.7:5000";  // ✅ Backend server IP (same network as ESP32: 10.82.225.x)
const char* DEVICE_SERIAL = "ESP32-CAM-001";              // Must match registered serial

// ===================
// Detection Settings
// ===================
const int DETECTION_INTERVAL = 10000;     // Capture image every 10 seconds
const int HEARTBEAT_INTERVAL = 30000;    // Send heartbeat every 30 seconds
const float CONFIDENCE_THRESHOLD = 0.25;   // Detection confidence threshold (lowered for better detection)

// ===================
// Deterrent Settings
// ===================
const int DETERRENT_DURATION = 5000;      // Activate deterrent for 5 seconds
const int BUZZER_FREQUENCY = 2000;       // Buzzer frequency (Hz)
const int LED_BLINK_INTERVAL = 200;      // LED blink interval (ms)

// ===================
// WiFi Reconnection Settings
// ===================
const int WIFI_RECONNECT_INTERVAL = 5000;  // Try to reconnect every 5 seconds
const int WIFI_MAX_RECONNECT_ATTEMPTS = 10; // Max reconnection attempts before giving up

httpd_handle_t stream_httpd = NULL;

// ===================
// State Variables
// ===================
bool deterrentActive = false;
unsigned long lastDetection = 0;
unsigned long lastHeartbeat = 0;
unsigned long deterrentStartTime = 0;
unsigned long lastWiFiCheck = 0;
String lastThreatLevel = "none";
int wifiReconnectAttempts = 0;

// ===================
// Stream Handler (IMPROVED - with connection checking)
// ===================
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  char part_buf[64];

  // Check if WiFi is connected first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Stream request received but WiFi not connected");
    httpd_resp_set_status(req, "503 Service Unavailable");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_send(req, "WiFi not connected", HTTPD_RESP_USE_STRLEN);
    return ESP_FAIL;
  }

  // Enable CORS for browser access
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  httpd_resp_set_hdr(req, "Connection", "keep-alive");  // ✅ Keep connection alive
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache, no-store, must-revalidate");
  httpd_resp_set_hdr(req, "Pragma", "no-cache");
  httpd_resp_set_hdr(req, "Expires", "0");
  
  // Set MJPEG content type with proper boundary
  httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  // Also set content-type header explicitly
  httpd_resp_set_hdr(req, "Content-Type", "multipart/x-mixed-replace;boundary=frame");

  Serial.println("📹 Stream client connected");
  // Note: httpd_req_get_remote_addr() is not available in ESP32 HTTP server API
  // Client connection is logged when stream starts

  while (true) {
    // ✅ Check if client is still connected
    if (httpd_req_get_hdr_value_len(req, "Connection") == 0) {
      Serial.println("📴 Client disconnected from stream");
      break;
    }

    // ✅ Check WiFi connection before capturing
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("❌ WiFi disconnected during stream");
      break;
    }

    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("⚠️ Camera capture failed, retrying...");
      delay(100);
      continue;  // ✅ Retry instead of failing
    }

    // ✅ Check if frame is valid
    if (fb->len == 0) {
      Serial.println("⚠️ Empty frame, skipping...");
      esp_camera_fb_return(fb);
      continue;
    }

    // Format MJPEG frame header with proper boundary
    // Each frame must start with boundary delimiter
    size_t hlen = snprintf(part_buf, 64,
      "\r\n--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n",
      fb->len);

    // ✅ Send header chunk
    res = httpd_resp_send_chunk(req, part_buf, hlen);
    if (res != ESP_OK) {
      Serial.println("❌ Failed to send header chunk");
      esp_camera_fb_return(fb);
      break;
    }

    // ✅ Send image chunk
    res = httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
    if (res != ESP_OK) {
      Serial.println("❌ Failed to send image chunk");
      esp_camera_fb_return(fb);
      break;
    }

    // ✅ Send frame boundary
    res = httpd_resp_send_chunk(req, "\r\n", 2);
    if (res != ESP_OK) {
      Serial.println("❌ Failed to send frame boundary");
      esp_camera_fb_return(fb);
      break;
    }

    esp_camera_fb_return(fb);
    
    // ✅ Small delay to prevent overwhelming the connection
    delay(50);  // ~20 FPS max
  }

  Serial.println("📴 Stream handler ended");
  return res;
}

// ===================
// Start Web Server
// ===================
static esp_err_t options_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  httpd_resp_send(req, NULL, 0);
  return ESP_OK;
}
  
void startCameraServer() {
  // ✅ Stop existing server if running
  if (stream_httpd != NULL) {
    httpd_stop(stream_httpd);
    stream_httpd = NULL;
  }

  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  config.ctrl_port += 1;
  config.max_uri_handlers = 8;  // ✅ Increase handler limit
  config.max_resp_headers = 8;   // ✅ Increase header limit
  config.lru_purge_enable = true; // ✅ Enable LRU purge for better memory management

  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t options_uri = {
    .uri       = "/stream",
    .method    = HTTP_OPTIONS,
    .handler   = options_handler,
    .user_ctx  = NULL
  };

  esp_err_t start_result = httpd_start(&stream_httpd, &config);
  if (start_result == ESP_OK) {
    Serial.println("   ✅ HTTP server started");
    esp_err_t uri_result1 = httpd_register_uri_handler(stream_httpd, &stream_uri);
    esp_err_t uri_result2 = httpd_register_uri_handler(stream_httpd, &options_uri);
    
    if (uri_result1 == ESP_OK && uri_result2 == ESP_OK) {
      Serial.println("✅ Camera server started with CORS support");
      Serial.print("   Stream URL: http://");
      Serial.print(WiFi.localIP());
      Serial.println("/stream");
      Serial.print("   Server port: ");
      Serial.println(config.server_port);
      Serial.println("   ✅ Stream endpoint is ready!");
      Serial.println("   📹 You can now access the stream in your browser");
    } else {
      Serial.println("❌ Failed to register URI handlers");
      Serial.print("   Stream URI result: 0x");
      Serial.println(uri_result1, HEX);
      Serial.print("   Options URI result: 0x");
      Serial.println(uri_result2, HEX);
    }
  } else {
    Serial.println("❌ Camera server start failed");
    Serial.print("   Error code: 0x");
    Serial.println(start_result, HEX);
    Serial.println("   Possible causes:");
    Serial.println("     - Port 80 already in use");
    Serial.println("     - Insufficient memory");
    Serial.println("     - WiFi not connected");
    Serial.print("   Current WiFi status: ");
    Serial.println(WiFi.status());
  }
}

// ===================
// WiFi Reconnection Function (NEW)
// ===================
bool reconnectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;  // Already connected
  }

  Serial.println("📡 WiFi disconnected. Attempting to reconnect...");
  Serial.print("   Attempt: ");
  Serial.println(wifiReconnectAttempts + 1);

  // Configure static IP before reconnecting
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("⚠️ Static IP configuration failed during reconnect");
  }

  WiFi.disconnect();
  delay(100);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi reconnected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    wifiReconnectAttempts = 0;
    
    // ✅ Restart camera server after reconnection
    startCameraServer();
    return true;
  } else {
    wifiReconnectAttempts++;
    Serial.print("❌ WiFi reconnection failed (");
    Serial.print(wifiReconnectAttempts);
    Serial.println(" attempts)");
    return false;
  }
}

// ===================
// Activate Deterrent
// ===================
void activateDeterrent(String threatLevel) {
  if (deterrentActive) {
    return; // Already active
  }

  deterrentActive = true;
  deterrentStartTime = millis();
  lastThreatLevel = threatLevel;

  Serial.println("🚨 ACTIVATING DETERRENT!");
  Serial.print("   Threat Level: ");
  Serial.println(threatLevel);

  // Activate buzzer using LEDC (PWM) for tone
  ledcAttach(BUZZER_PIN, BUZZER_FREQUENCY, 8);
  ledcWrite(BUZZER_PIN, 128); // 50% duty cycle for sound
  
  // Activate LED
  digitalWrite(LED_PIN, HIGH);
  
  // Activate flash LED
  digitalWrite(FLASH_LED_PIN, HIGH);
}

// ===================
// Deactivate Deterrent
// ===================
void deactivateDeterrent() {
  if (!deterrentActive) {
    return;
  }

  deterrentActive = false;
  
  Serial.println("✅ Deactivating deterrent");

  // Stop buzzer
  ledcWrite(BUZZER_PIN, 0);
  ledcDetach(BUZZER_PIN);
  
  // Turn off LED
  digitalWrite(LED_PIN, LOW);
  
  // Turn off flash LED
  digitalWrite(FLASH_LED_PIN, LOW);
}

// ===================
// Update Deterrent (for blinking effect)
// ===================
void updateDeterrent() {
  if (!deterrentActive) {
    return;
  }

  // Check if deterrent duration has elapsed
  if (millis() - deterrentStartTime > DETERRENT_DURATION) {
    deactivateDeterrent();
    return;
  }

  // Blink LED and flash LED
  static unsigned long lastBlink = 0;
  static bool blinkState = false;
  
  if (millis() - lastBlink > LED_BLINK_INTERVAL) {
    blinkState = !blinkState;
    
    // Blink LED
    digitalWrite(LED_PIN, blinkState);
    
    // Blink flash LED
    digitalWrite(FLASH_LED_PIN, blinkState);
    
    lastBlink = millis();
  }
}

// ===================
// Send Heartbeat to SADS (IMPROVED - with error handling)
// ===================
void sendHeartbeat() {
  // ✅ Check WiFi before sending
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Cannot send heartbeat: WiFi disconnected");
    return;
  }

  HTTPClient http;
  String url = String(SADS_SERVER) + "/api/devices/heartbeat";
  
  http.begin(url);
  http.setTimeout(5000);  // ✅ 5 second timeout
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload (using JsonDocument instead of deprecated StaticJsonDocument)
  JsonDocument doc;
  doc["serialNumber"] = DEVICE_SERIAL;
  doc["batteryLevel"] = 100;  // You can add battery monitoring here
  doc["signalStrength"] = WiFi.RSSI();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["type"] = "camera";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Heartbeat sent: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("❌ Heartbeat failed: ");
    Serial.println(httpResponseCode);
    Serial.print("   Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

// ===================
// Capture Image and Send for Detection (IMPROVED - with error handling)
// ===================
void captureAndDetect() {
  // ✅ Check WiFi before capturing
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Cannot capture: WiFi disconnected");
    return;
  }

  Serial.println("📸 Capturing image for detection...");
  
  // Capture frame
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }
  
  Serial.printf("📷 Image captured: %d bytes\n", fb->len);
  
  // ✅ Validate frame size
  if (fb->len == 0) {
    Serial.println("❌ Empty frame captured");
    esp_camera_fb_return(fb);
    return;
  }
  
  // Convert to base64
  String base64Image = base64::encode((uint8_t*)fb->buf, fb->len);
  String imageData = "data:image/jpeg;base64," + base64Image;
  
  // Free frame buffer
  esp_camera_fb_return(fb);
  
  // Send to SADS for detection
  HTTPClient http;
  String url = String(SADS_SERVER) + "/api/yolo/device-detect";
  
  http.begin(url);
  http.setTimeout(30000);  // ✅ 30 second timeout for detection
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Serial", DEVICE_SERIAL);
  
  // Create JSON payload (using JsonDocument instead of deprecated StaticJsonDocument)
  JsonDocument doc;
  doc["image"] = imageData;
  doc["confidence"] = CONFIDENCE_THRESHOLD;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("🔄 Sending image to SADS for detection...");
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Detection response: ");
    Serial.println(httpResponseCode);
    
    // Parse response (using JsonDocument instead of deprecated StaticJsonDocument)
    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      bool success = responseDoc["success"];
      bool threatDetected = responseDoc["threatDetected"] | false;
      String threatLevel = responseDoc["threatLevel"] | "none";
      bool shouldActivateDeterrent = responseDoc["shouldActivateDeterrent"] | false;
      int totalDetections = responseDoc["total_detections"] | 0;
      
      Serial.printf("📊 Detection Results:\n");
      Serial.printf("   Success: %s\n", success ? "Yes" : "No");
      Serial.printf("   Threat Detected: %s\n", threatDetected ? "Yes" : "No");
      Serial.printf("   Threat Level: %s\n", threatLevel.c_str());
      Serial.printf("   Total Detections: %d\n", totalDetections);
      Serial.printf("   Activate Deterrent: %s\n", shouldActivateDeterrent ? "Yes" : "No");
      
      // Activate deterrent if threat detected
      if (threatDetected && shouldActivateDeterrent) {
        Serial.println("🚨 THREAT DETECTED! Activating deterrent...");
        activateDeterrent(threatLevel);
      } else if (threatDetected) {
        Serial.println("⚠️ Threat detected but deterrent not required");
      } else {
        Serial.println("✅ No threat detected");
        // Deactivate deterrent if no threat
        if (deterrentActive) {
          deactivateDeterrent();
        }
      }
      
      // Log detections if available (using modern syntax instead of containsKey)
      if (responseDoc["detections"].is<JsonArray>()) {
        JsonArray detections = responseDoc["detections"].as<JsonArray>();
        Serial.printf("   Detected Animals:\n");
        for (JsonObject detection : detections) {
          String name = detection["name"] | "Unknown";
          float confidence = detection["confidence"] | 0.0;
          Serial.printf("      - %s (%.1f%%)\n", name.c_str(), confidence);
        }
      }
    } else {
      Serial.print("⚠️ Failed to parse response: ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.print("❌ Detection request failed: ");
    Serial.println(httpResponseCode);
    Serial.print("   Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

// ===================
// Setup
// ===================
void setup() {
  Serial.begin(115200);
  delay(1000);  // ✅ Give serial time to initialize
  Serial.println("\n=== SADS ESP32-CAM Integration ===");

  // Initialize deterrent pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Camera configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  // Camera settings
  config.xclk_freq_hz = 20000000;  // Reduced from 24MHz to 20MHz for stability
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_QVGA; // 320x240 (smaller = less memory)
  config.jpeg_quality = 12;            // Higher number = lower quality but less memory
  config.fb_count     = 1;             // Single frame buffer
  config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location   = CAMERA_FB_IN_PSRAM;  // Use PSRAM if available

  // Initialize camera with retry logic
  esp_err_t err;
  int cameraInitAttempts = 0;
  const int maxCameraInitAttempts = 3;
  
  while (cameraInitAttempts < maxCameraInitAttempts) {
    err = esp_camera_init(&config);
    if (err == ESP_OK) {
      Serial.println("✅ Camera initialized successfully");
      break;
    } else {
      cameraInitAttempts++;
      Serial.printf("⚠️ Camera init failed (attempt %d/%d) with error 0x%x\n", 
                    cameraInitAttempts, maxCameraInitAttempts, err);
      if (cameraInitAttempts < maxCameraInitAttempts) {
        Serial.println("   Retrying in 1 second...");
        delay(1000);
        // Try reducing frame size if first attempt failed
        if (cameraInitAttempts == 2) {
          config.frame_size = FRAMESIZE_QQVGA; // 160x120 - even smaller
          config.jpeg_quality = 15; // Lower quality
          Serial.println("   Trying smaller frame size (160x120)...");
        }
      }
    }
  }
  
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed after %d attempts with error 0x%x\n", 
                  maxCameraInitAttempts, err);
    Serial.println("   Possible causes:");
    Serial.println("   1. Wrong board selected (should be 'AI Thinker ESP32-CAM')");
    Serial.println("   2. PSRAM not enabled (check Tools → PSRAM: 'Enabled')");
    Serial.println("   3. Camera module not connected properly");
    Serial.println("   4. Insufficient memory");
    Serial.println("   Continuing without camera...");
    // Don't return - continue with WiFi setup even if camera fails
  }

  // Configure static IP BEFORE connecting to WiFi
  Serial.println("📡 Configuring static IP...");
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("⚠️ Static IP configuration failed! Will use DHCP...");
  } else {
    Serial.println("✅ Static IP configuration applied");
    Serial.print("   IP Address: ");
    Serial.println(local_IP);
    Serial.print("   Gateway: ");
    Serial.println(gateway);
  }

  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);  // ✅ Set WiFi mode explicitly
  WiFi.setAutoReconnect(true);  // ✅ Enable auto-reconnect
  WiFi.persistent(true);  // ✅ Save WiFi credentials to flash
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  int maxAttempts = 30;  // ✅ Increased from 20 to 30 (15 seconds total)
  Serial.print("   Connecting");
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
    // Print status every 5 seconds
    if (attempts % 10 == 0) {
      Serial.println();
      Serial.print("   Still connecting... (");
      Serial.print(attempts);
      Serial.print("/");
      Serial.print(maxAttempts);
      Serial.println(")");
      Serial.print("   WiFi status: ");
      Serial.println(WiFi.status());
    }
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("   Subnet: ");
    Serial.println(WiFi.subnetMask());
    Serial.print("   RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("📹 Stream URL: http://");
    Serial.print(WiFi.localIP());
    Serial.println("/stream");
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.println("   Please check your credentials and network settings.");
    return;
  }

  // Start camera server for live streaming
  startCameraServer();
  
  // Print configuration
  Serial.println("\n=== Configuration ===");
  Serial.print("Device Serial: ");
  Serial.println(DEVICE_SERIAL);
  Serial.print("SADS Server: ");
  Serial.println(SADS_SERVER);
  Serial.print("Detection Interval: ");
  Serial.print(DETECTION_INTERVAL / 1000);
  Serial.println(" seconds");
  Serial.print("Heartbeat Interval: ");
  Serial.print(HEARTBEAT_INTERVAL / 1000);
  Serial.println(" seconds");
  Serial.println("\n✅ Setup complete. Starting detection loop...\n");
  
  // Send initial heartbeat
  delay(2000);
  sendHeartbeat();
}

// ===================
// Main Loop (IMPROVED - with WiFi monitoring)
// ===================
void loop() {
  unsigned long currentMillis = millis();
  
  // ✅ Check WiFi connection periodically
  if (currentMillis - lastWiFiCheck >= WIFI_RECONNECT_INTERVAL) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️ WiFi connection lost!");
      reconnectWiFi();
    }
    lastWiFiCheck = currentMillis;
  }
  
  // Update deterrent (blinking, duration check)
  updateDeterrent();
  
  // Send heartbeat periodically (only if WiFi connected)
  if (WiFi.status() == WL_CONNECTED && currentMillis - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentMillis;
  }
  
  // Capture and detect periodically (only if WiFi connected)
  if (WiFi.status() == WL_CONNECTED && currentMillis - lastDetection >= DETECTION_INTERVAL) {
    captureAndDetect();
    lastDetection = currentMillis;
  }
  
  delay(100); // Small delay to prevent watchdog issues
}
