/**
 * Check ESP32 IoT Camera Status
 * Run with: node check_esp32_status.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Device = require('./backend/models/device');
const Property = require('./backend/models/property');

const DEVICE_SERIAL = 'ESP32-CAM-001';

async function checkStatus() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/sads?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find the device
    const device = await Device.findOne({ serialNumber: DEVICE_SERIAL })
      .populate('assignedProperty', 'name address');
    
    if (!device) {
      console.log('❌ Device Status: NOT REGISTERED');
      console.log(`   Serial Number: ${DEVICE_SERIAL}`);
      console.log('\n⚠️  The ESP32 device is not registered in SADS.');
      console.log('   Please register it via:');
      console.log('   1. Web UI: http://localhost:5173/devices');
      console.log('   2. Or run: node register_esp32_device.js');
      await mongoose.disconnect();
      return;
    }
    
    // Calculate time since last ping
    const now = new Date();
    const lastPing = new Date(device.lastPing);
    const minutesSincePing = Math.floor((now.getTime() - lastPing.getTime()) / (1000 * 60));
    const secondsSincePing = Math.floor((now.getTime() - lastPing.getTime()) / 1000);
    
    // Determine health status
    let healthStatus = '🟢 Healthy';
    let healthDetails = [];
    
    if (device.status === 'offline' || minutesSincePing > 30) {
      healthStatus = '🔴 Critical';
      healthDetails.push('Device is offline or no heartbeat for >30 minutes');
    } else if (device.batteryLevel < 20 || device.signalStrength < 30 || minutesSincePing > 10) {
      healthStatus = '🟡 Warning';
      if (device.batteryLevel < 20) healthDetails.push('Low battery');
      if (device.signalStrength < 30) healthDetails.push('Weak signal');
      if (minutesSincePing > 10) healthDetails.push('No heartbeat for >10 minutes');
    }
    
    // Display status
    console.log('═══════════════════════════════════════════════════════');
    console.log('📡 ESP32 IoT CAMERA STATUS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 Device Information:');
    console.log(`   Serial Number: ${device.serialNumber}`);
    console.log(`   Type: ${device.type}`);
    console.log(`   Device ID: ${device._id}`);
    console.log(`   Status: ${device.status === 'online' ? '🟢 Online' : '🔴 Offline'}`);
    console.log(`   Health: ${healthStatus}`);
    if (healthDetails.length > 0) {
      healthDetails.forEach(detail => console.log(`      ⚠️  ${detail}`));
    }
    console.log('');
    
    console.log('📊 Device Metrics:');
    console.log(`   Battery Level: ${device.batteryLevel}% ${device.batteryLevel < 20 ? '⚠️' : ''}`);
    console.log(`   Signal Strength: ${device.signalStrength}% ${device.signalStrength < 30 ? '⚠️' : ''}`);
    console.log('');
    
    console.log('⏱️  Last Communication:');
    if (secondsSincePing < 60) {
      console.log(`   Last Ping: ${secondsSincePing} seconds ago ✅`);
    } else if (minutesSincePing < 60) {
      console.log(`   Last Ping: ${minutesSincePing} minutes ago ${minutesSincePing > 10 ? '⚠️' : '✅'}`);
    } else {
      const hoursSincePing = Math.floor(minutesSincePing / 60);
      console.log(`   Last Ping: ${hoursSincePing} hours ago ❌`);
    }
    console.log(`   Last Ping Time: ${lastPing.toLocaleString()}`);
    console.log('');
    
    console.log('🏢 Property Assignment:');
    if (device.assignedProperty) {
      if (typeof device.assignedProperty === 'object') {
        console.log(`   Property: ${device.assignedProperty.name}`);
        console.log(`   Address: ${device.assignedProperty.address || 'N/A'}`);
      } else {
        console.log(`   Property ID: ${device.assignedProperty}`);
      }
    } else {
      console.log('   ⚠️  Not assigned to any property');
    }
    console.log('');
    
    console.log('🔧 Configuration:');
    console.log(`   Sensitivity: ${device.config?.sensitivity || 'medium'}`);
    console.log(`   Active Hours: ${device.config?.activeHours || '24/7'}`);
    console.log('');
    
    // ESP32 Code Configuration
    console.log('💻 ESP32 Code Configuration:');
    console.log(`   Expected Serial: ${DEVICE_SERIAL}`);
    console.log(`   SADS Server: http://10.190.173.7:5000`);
    console.log(`   Heartbeat Interval: 30 seconds`);
    console.log(`   Detection Interval: 10 seconds`);
    console.log(`   Stream URL: http://10.190.173.44/stream`);
    console.log('');
    
    // Recommendations
    console.log('💡 Recommendations:');
    if (device.status === 'offline') {
      console.log('   ❌ Device is offline. Check:');
      console.log('      1. ESP32 is powered on');
      console.log('      2. WiFi connection (SSID: SSD)');
      console.log('      3. ESP32 Serial Monitor for errors');
      console.log('      4. Backend server is running on port 5000');
    } else if (minutesSincePing > 10) {
      console.log('   ⚠️  Device hasn\'t sent heartbeat recently. Check:');
      console.log('      1. ESP32 is still running');
      console.log('      2. Network connectivity');
      console.log('      3. Backend API is accessible');
    } else {
      console.log('   ✅ Device is online and communicating!');
      console.log('      - Heartbeats are being received');
      console.log('      - Device should be sending detections every 10 seconds');
      console.log('      - Check Admin Dashboard for live feed');
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkStatus();







