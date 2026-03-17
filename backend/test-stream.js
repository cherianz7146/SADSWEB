/**
 * Test script to check ESP32 stream connectivity
 * Usage: node test-stream.js http://10.82.225.44/stream
 */

const axios = require('axios');

const streamUrl = process.argv[2] || 'http://10.82.225.44/stream';

console.log('🧪 Testing ESP32 stream connection...');
console.log('   URL:', streamUrl);
console.log('');

async function testStream() {
  try {
    console.log('📡 Attempting to connect...');
    
    const response = await axios.get(streamUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'Accept': 'multipart/x-mixed-replace, image/jpeg, image/*'
      },
      validateStatus: (status) => status >= 200 && status < 400
    });

    console.log('✅ Connection successful!');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Headers:', Object.keys(response.headers));
    console.log('');
    console.log('📹 Stream is active. Receiving data...');
    console.log('   (Press Ctrl+C to stop)');
    
    let frameCount = 0;
    response.data.on('data', (chunk) => {
      frameCount++;
      if (frameCount % 10 === 0) {
        process.stdout.write(`\r   Frames received: ${frameCount}`);
      }
    });

    response.data.on('error', (error) => {
      console.error('\n❌ Stream error:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. Verify ESP32 is powered on');
      console.error('   2. Check if ESP32 is connected to WiFi');
      console.error('   3. Verify IP address is correct:', streamUrl.match(/http:\/\/([^\/]+)/)?.[1]);
      console.error('   4. Ensure ESP32 and computer are on same network');
      console.error('   5. Try accessing the URL directly in browser:', streamUrl);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. ESP32 might be slow to respond');
      console.error('   2. Check network connectivity');
      console.error('   3. Verify firewall is not blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. IP address might be incorrect');
      console.error('   2. DNS resolution failed');
    }
    
    process.exit(1);
  }
}

testStream();
