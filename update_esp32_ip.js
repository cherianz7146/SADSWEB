/**
 * Update ESP32 device with correct IP address
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Device = require('./backend/models/device');

const DEVICE_SERIAL = 'ESP32-CAM-001';
const ESP32_IP = '10.63.77.44'; // Your actual ESP32 camera IP
const OLD_IP = '10.190.173.44'; // Old IP to replace

async function updateDevice() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/sads?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find and update the device
    const device = await Device.findOne({ serialNumber: DEVICE_SERIAL });
    
    if (!device) {
      console.log('❌ Device not found. Please run register_esp32_direct.js first.');
      await mongoose.disconnect();
      return;
    }
    
    // Update metadata with correct IP (force update even if exists)
    if (!device.metadata) {
      device.metadata = {};
    }
    device.metadata.ipAddress = ESP32_IP;
    device.metadata.streamUrl = `http://${ESP32_IP}/stream`;
    
    // Mark as modified to ensure save
    device.markModified('metadata');
    await device.save();
    
    // Verify the update
    const updated = await Device.findOne({ serialNumber: DEVICE_SERIAL });
    console.log('\n📋 Verification:');
    console.log('   Metadata after update:', updated.metadata);
    
    console.log('✅ Device updated successfully!');
    console.log(`   Serial Number: ${device.serialNumber}`);
    console.log(`   IP Address: ${ESP32_IP}`);
    console.log(`   Stream URL: http://${ESP32_IP}/stream`);
    console.log(`   Status: ${device.status}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Update complete!');
    console.log('📺 The camera feed should now work in the dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateDevice();

