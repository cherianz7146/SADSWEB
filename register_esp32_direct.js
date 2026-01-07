/**
 * Direct ESP32-CAM Registration Script
 * Registers the device directly in MongoDB, bypassing API authentication
 * Run: node register_esp32_direct.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Device = require('./backend/models/device');
const Property = require('./backend/models/property');
const User = require('./backend/models/user');

const DEVICE_SERIAL = 'ESP32-CAM-001';
const DEVICE_TYPE = 'camera';
const ESP32_IP = '10.190.173.44'; // Your ESP32 camera IP address

async function registerDevice() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/sads?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Check if device already exists
    const existingDevice = await Device.findOne({ serialNumber: DEVICE_SERIAL });
    if (existingDevice) {
      console.log(`✅ Device ${DEVICE_SERIAL} already exists!`);
      console.log(`   Device ID: ${existingDevice._id}`);
      console.log(`   Status: ${existingDevice.status}`);
      
      // Update metadata with IP if not set
      if (!existingDevice.metadata || !existingDevice.metadata.ipAddress) {
        existingDevice.metadata = existingDevice.metadata || {};
        existingDevice.metadata.ipAddress = ESP32_IP;
        existingDevice.metadata.streamUrl = `http://${ESP32_IP}/stream`;
        await existingDevice.save();
        console.log(`   ✅ Updated metadata with IP address: ${ESP32_IP}`);
      }
      
      const prop = await Property.findById(existingDevice.assignedProperty);
      console.log(`   Assigned to Property: ${prop ? prop.name : 'Unknown'}`);
      await mongoose.disconnect();
      return;
    }
    
    // Find the first available property
    let property = await Property.findOne().sort({ createdAt: 1 });
    
    if (!property) {
      // Find any user to create property
      let user = await User.findOne().sort({ createdAt: 1 });
      
      if (!user) {
        console.log('⚠️  No users found. Creating a system admin user...');
        // Create a minimal system user for device registration
        user = await User.create({
          name: 'System Admin',
          email: 'system@sads.local',
          password: 'system', // Will be hashed if you have password hashing middleware
          role: 'admin',
          isActive: true
        });
        console.log(`✅ Created system user: ${user.name} (${user._id})\n`);
      }
      
      console.log(`⚠️  No properties found. Creating a default property for user: ${user.name}...`);
      property = await Property.create({
        name: 'Default Property',
        address: 'To be updated',
        description: 'Default property for ESP32 camera',
        managerId: user._id,
        status: 'active',
        cameraCount: 0
      });
      console.log(`✅ Created property: ${property.name} (${property._id})\n`);
    } else {
      console.log(`📋 Found property: ${property.name} (${property._id})\n`);
    }
    
    // Register the device with metadata (IP address)
    const device = await Device.create({
      serialNumber: DEVICE_SERIAL,
      type: DEVICE_TYPE,
      assignedProperty: property._id,
      status: 'offline', // Will change to 'online' when heartbeat is received
      batteryLevel: 100,
      signalStrength: 100,
      metadata: {
        ipAddress: ESP32_IP,
        streamUrl: `http://${ESP32_IP}/stream`
      }
    });
    
    console.log('✅ Device registered successfully!');
    console.log(`   Serial Number: ${device.serialNumber}`);
    console.log(`   Type: ${device.type}`);
    console.log(`   Device ID: ${device._id}`);
    console.log(`   Assigned to Property: ${property.name}`);
    console.log(`   Status: ${device.status}`);
    console.log(`   IP Address: ${ESP32_IP}`);
    console.log(`   Stream URL: http://${ESP32_IP}/stream`);
    console.log('\n📡 The ESP32 should now be able to connect!');
    console.log('   Check the Serial Monitor - you should see:');
    console.log('   - Heartbeat sent: 200 (instead of 404)');
    console.log('   - Detection requests will work');
    console.log('\n📺 The camera feed will appear in the Admin Dashboard:');
    console.log('   http://localhost:5173/admin/dashboard');
    
    await mongoose.disconnect();
    console.log('\n✅ Registration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Device with this serial number already exists!');
    }
    console.error('\nFull error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

registerDevice();

