# ESP32 Camera Live Feed Troubleshooting Guide

## Problem: ESP32 Camera Not Showing Live Feed

If the ESP32 camera feed is blank/black, follow these troubleshooting steps:

## Quick Checks

### 1. Verify ESP32 is Powered On
- Check that the ESP32-CAM is powered via USB or external power supply
- LED indicators should be on

### 2. Check ESP32 WiFi Connection
- Open Arduino Serial Monitor (115200 baud)
- Look for messages like:
  - `✅ WiFi connected!`
  - `IP Address: 10.82.225.44`
  - `📹 Stream URL: http://10.82.225.44/stream`

### 3. Verify ESP32 is Sending Heartbeats
- In Serial Monitor, you should see:
  - `✅ Heartbeat sent: 200` (every 30 seconds)
- If heartbeats are failing, check:
  - Backend server is running on `http://10.82.225.7:5000`
  - WiFi credentials in ESP32 code match your network
  - ESP32 can reach the backend server

### 4. Check Device Registration
- Open browser console (F12) on Admin Dashboard
- Look for:
  - `📷 ESP32 cameras found: [...]`
  - `📡 Device IP: 10.82.225.44`
- If device is not found:
  - ESP32 may not be sending heartbeats
  - Check backend logs for heartbeat errors

### 5. Test Stream URL Directly
- Try opening the stream URL directly in browser:
  - `http://10.82.225.44/stream`
- If this works, the issue is with the frontend
- If this doesn't work, the issue is with ESP32 or network

## Common Issues and Solutions

### Issue 1: Device Not Found in Dashboard
**Symptoms:** No ESP32 camera appears in device selector

**Solutions:**
1. Check ESP32 Serial Monitor for heartbeat messages
2. Verify backend is running: `http://localhost:5000`
3. Check backend logs for device registration
4. Manually refresh devices: Click "Refresh" button or reload page

### Issue 2: Stream URL is Wrong
**Symptoms:** Device found but stream URL is incorrect

**Solutions:**
1. Check device metadata in browser console
2. Verify ESP32 static IP is `10.82.225.44`
3. If IP changed, update it in the error dialog or device management page
4. ESP32 should send IP in heartbeat: `ipAddress: "10.82.225.44"`

### Issue 3: Network Connectivity
**Symptoms:** Stream URL is correct but feed is black

**Solutions:**
1. Ensure ESP32 and computer are on the same network
2. Ping ESP32: `ping 10.82.225.44`
3. Check firewall settings
4. Try accessing stream directly: `http://10.82.225.44/stream`

### Issue 4: ESP32 Camera Server Not Running
**Symptoms:** ESP32 connected to WiFi but stream doesn't work

**Solutions:**
1. Check Serial Monitor for: `✅ Camera server started`
2. Verify camera initialization: `✅ Camera initialized successfully`
3. If camera init fails, check camera wiring/connections

### Issue 5: Wrong IP Address in Frontend
**Symptoms:** Stream URL shows old/wrong IP

**Solutions:**
1. ESP32 static IP is: `10.82.225.44` (not 10.63.77.44)
2. Update device IP via error dialog or device management
3. ESP32 should auto-update IP via heartbeat

## Manual IP Update

If the IP address is wrong, you can update it:

1. **Via Error Dialog:**
   - When stream fails, an error dialog appears
   - Enter correct IP: `10.82.225.44`
   - Click "Update IP"

2. **Via Device Management:**
   - Go to Devices page
   - Find ESP32-CAM-001
   - Edit device and update IP address

3. **Via API:**
   ```bash
   PATCH /api/devices/:deviceId/ip
   Body: { "ipAddress": "10.82.225.44" }
   ```

## ESP32 Configuration

Verify ESP32 code has correct settings:

```cpp
// Static IP Configuration
IPAddress local_IP(10, 82, 225, 44);      // Static IP address
IPAddress gateway(10, 82, 225, 63);      // Router/Gateway IP

// SADS Backend Configuration
const char* SADS_SERVER = "http://10.82.225.7:5000";
const char* DEVICE_SERIAL = "ESP32-CAM-001";
```

## Network Requirements

- ESP32 and backend server must be on same network
- ESP32 static IP: `10.82.225.44`
- Backend server IP: `10.82.225.7:5000`
- Gateway IP: `10.82.225.63`
- Subnet: `255.255.255.0`

## Still Not Working?

1. Check browser console for errors (F12)
2. Check backend server logs
3. Check ESP32 Serial Monitor
4. Verify all IP addresses match your network configuration
5. Try restarting ESP32 (unplug and replug power)
6. Try restarting backend server

## Expected Behavior

When everything works:
- ESP32 connects to WiFi
- ESP32 sends heartbeat every 30 seconds
- Device appears in Admin Dashboard
- Stream URL is: `http://10.82.225.44/stream`
- Live feed displays in black area
- Detection can be started


