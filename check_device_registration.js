/**
 * Check if ESP32 device is registered and visible
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Device = require('./backend/models/device');
const Property = require('./backend/models/property');

async function checkDevice() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/sads?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find the device
    const device = await Device.findOne({ serialNumber: 'ESP32-CAM-001' });
    
    if (!device) {
      console.log('❌ Device ESP32-CAM-001 NOT FOUND in database');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Device found!');
    console.log(`   Serial Number: ${device.serialNumber}`);
    console.log(`   Type: ${device.type}`);
    console.log(`   Status: ${device.status}`);
    console.log(`   Device ID: ${device._id}`);
    console.log(`   Metadata:`, device.metadata);
    
    // Check assigned property
    const property = await Property.findById(device.assignedProperty);
    console.log(`   Assigned Property: ${property ? property.name : 'NOT FOUND'} (${device.assignedProperty})`);
    
    // Check all devices
    const allDevices = await Device.find({});
    console.log(`\n📊 Total devices in database: ${allDevices.length}`);
    allDevices.forEach(d => {
      console.log(`   - ${d.serialNumber} (${d.type}) - ${d.status}`);
    });
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkDevice();





