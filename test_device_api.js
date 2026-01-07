/**
 * Test the device health API endpoint
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🔍 Testing Device Health API...\n');
    
    // First, try to login
    console.log('Step 1: Attempting login...');
    console.log('   (You may need to provide credentials or use an existing token)\n');
    
    // For testing, you can manually get a token from browser localStorage
    // Or login via API
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'password';
    
    let token;
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });
      token = loginRes.data.token;
      console.log('✅ Login successful!\n');
    } catch (error) {
      console.log('⚠️  Login failed. You can manually get a token from browser DevTools:');
      console.log('   1. Open http://localhost:5173');
      console.log('   2. Open DevTools (F12)');
      console.log('   3. Go to Application > Local Storage');
      console.log('   4. Copy the "token" value');
      console.log('   5. Set it as: $env:API_TOKEN="your-token-here"\n');
      
      token = process.env.API_TOKEN;
      if (!token) {
        console.error('❌ No token available. Cannot test API.');
        return;
      }
    }
    
    // Test device health endpoint
    console.log('Step 2: Testing /api/devices/health endpoint...');
    const response = await axios.get(`${API_BASE}/devices/health`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API Response:');
    console.log(`   Total Devices: ${response.data.totalDevices}`);
    console.log(`   Devices Array Length: ${response.data.devices?.length || 0}\n`);
    
    if (response.data.devices && response.data.devices.length > 0) {
      console.log('📋 Devices found:');
      response.data.devices.forEach((device, index) => {
        console.log(`   ${index + 1}. ${device.serialNumber} (${device.type}) - ${device.status}`);
        if (device.metadata) {
          console.log(`      IP: ${device.metadata.ipAddress || 'N/A'}`);
        }
      });
      
      const esp32Devices = response.data.devices.filter(d => 
        d.type === 'camera' && d.serialNumber.startsWith('ESP32')
      );
      
      console.log(`\n📷 ESP32 Cameras: ${esp32Devices.length}`);
      if (esp32Devices.length === 0) {
        console.log('   ⚠️  No ESP32 cameras found in API response!');
        console.log('   This might be why the dashboard shows "not registered"');
      }
    } else {
      console.log('❌ No devices returned from API!');
      console.log('   This explains why the dashboard shows "not registered"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI();



