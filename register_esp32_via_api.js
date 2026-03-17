/**
 * Register ESP32-CAM directly via API
 * This bypasses the frontend form
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const DEVICE_SERIAL = 'ESP32-CAM-001';
const DEVICE_TYPE = 'camera';
const ESP32_IP = '10.190.173.44'; // Your ESP32 camera IP

// You'll need to get a valid auth token
// Option 1: Login via API first
// Option 2: Use an existing token
async function loginAndGetToken(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getProperties(token) {
  try {
    const response = await axios.get(`${API_BASE}/properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch properties:', error.response?.data || error.message);
    throw error;
  }
}

async function registerDevice(token, propertyId) {
  try {
    const response = await axios.post(
      `${API_BASE}/devices`,
      {
        serialNumber: DEVICE_SERIAL,
        type: DEVICE_TYPE,
        assignedProperty: propertyId,
        location: {
          latitude: 0.0,
          longitude: 0.0
        },
        metadata: {
          ipAddress: ESP32_IP,
          streamUrl: `http://${ESP32_IP}/stream`
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Device already registered!');
      return null;
    }
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔐 Step 1: Logging in...');
    console.log('   Please provide your admin email and password.');
    console.log('   Or edit this script to hardcode credentials.\n');
    
    // TODO: Replace with your admin credentials
    const email = process.env.ADMIN_EMAIL || 'your-admin@email.com';
    const password = process.env.ADMIN_PASSWORD || 'your-password';
    
    if (email === 'your-admin@email.com') {
      console.error('❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      console.error('   Or edit this script to include your credentials');
      console.error('\n   Example:');
      console.error('   $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="password"; node register_esp32_via_api.js');
      process.exit(1);
    }
    
    const token = await loginAndGetToken(email, password);
    console.log('✅ Login successful!\n');
    
    console.log('📋 Step 2: Fetching properties...');
    const properties = await getProperties(token);
    
    if (!properties || properties.length === 0) {
      console.error('❌ No properties found!');
      console.error('   Please create a property first via the web UI:');
      console.error('   http://localhost:5173/admin/properties');
      process.exit(1);
    }
    
    console.log(`✅ Found ${properties.length} property/properties`);
    const firstProperty = properties[0];
    console.log(`   Using: ${firstProperty.name} (${firstProperty._id})\n`);
    
    console.log('📡 Step 3: Registering ESP32 camera...');
    const device = await registerDevice(token, firstProperty._id);
    
    if (device) {
      console.log('✅ Device registered successfully!');
      console.log(`   Serial Number: ${device.serialNumber}`);
      console.log(`   Type: ${device.type}`);
      console.log(`   Device ID: ${device._id}`);
      console.log(`   Status: ${device.status}`);
      console.log(`   Assigned to: ${firstProperty.name}`);
    } else {
      console.log('ℹ️  Device was already registered.');
    }
    
    console.log('\n✅ Registration complete!');
    console.log('📺 The ESP32 camera should now appear in the dashboard.');
    console.log('   Check: http://localhost:5173/admin/dashboard');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

main();





