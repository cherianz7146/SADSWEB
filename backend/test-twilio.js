/**
 * Twilio Test Script
 * Run this to test your Twilio configuration
 * Usage: node test-twilio.js
 */

require('dotenv').config();
const twilioService = require('./services/twilioservice');

// Test phone number (your verified caller ID)
const TEST_PHONE = '+917306901750';

console.log('\n===========================================');
console.log('🧪 TWILIO CONFIGURATION TEST');
console.log('===========================================\n');

// Display configuration
console.log('📋 Configuration:');
console.log('  Account SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
console.log('  Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('  Phone Number:', process.env.TWILIO_PHONE_NUMBER || '❌ Missing');
console.log('  WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER || '❌ Missing');
console.log('  Test Target:', TEST_PHONE);
console.log('\n===========================================\n');

async function runTests() {
  try {
    // Test 1: SMS
    console.log('📱 Test 1: Sending SMS...');
    const smsResult = await twilioService.sendTestAlert(TEST_PHONE, 'sms');
    if (smsResult.success) {
      console.log('✅ SMS sent successfully!');
      console.log('   SID:', smsResult.sid);
      console.log('   Status:', smsResult.status);
    } else {
      console.log('❌ SMS failed:', smsResult.error);
    }
    console.log('\n-------------------------------------------\n');

    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: WhatsApp
    console.log('📲 Test 2: Sending WhatsApp...');
    console.log('⚠️  Note: Make sure you joined sandbox with "join mighty-rabbit"');
    const whatsappResult = await twilioService.sendTestAlert(TEST_PHONE, 'whatsapp');
    if (whatsappResult.success) {
      console.log('✅ WhatsApp sent successfully!');
      console.log('   SID:', whatsappResult.sid);
      console.log('   Status:', whatsappResult.status);
    } else {
      console.log('❌ WhatsApp failed:', whatsappResult.error);
    }
    console.log('\n-------------------------------------------\n');

    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Voice Call
    console.log('📞 Test 3: Making Voice Call...');
    const callResult = await twilioService.sendTestAlert(TEST_PHONE, 'call');
    if (callResult.success) {
      console.log('✅ Call initiated successfully!');
      console.log('   SID:', callResult.sid);
      console.log('   Status:', callResult.status);
      console.log('   📱 Answer your phone to hear the test message!');
    } else {
      console.log('❌ Call failed:', callResult.error);
    }
    console.log('\n-------------------------------------------\n');

    // Test 4: Smart Alert (simulated detection)
    console.log('🦌 Test 4: Testing Smart Alert...');
    const mockDetection = {
      label: 'elephant',
      probability: 0.95,
      propertyName: 'Test Farm',
      detectedAt: new Date()
    };
    const mockUser = {
      name: 'Test User',
      phone: TEST_PHONE
    };
    
    const smartAlertResult = await twilioService.sendSmartAlert(mockDetection, mockUser);
    console.log('Smart Alert Level:', smartAlertResult.level);
    console.log('Results:', JSON.stringify(smartAlertResult, null, 2));
    console.log('\n===========================================\n');

    console.log('✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Check your phone for SMS');
    console.log('   - Check WhatsApp for message (if joined sandbox)');
    console.log('   - Check for voice call');
    console.log('\n===========================================\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
  }
}

// Run the tests
console.log('Starting tests in 2 seconds...\n');
setTimeout(() => {
  runTests().then(() => {
    console.log('\n✅ Test script completed successfully!\n');
    process.exit(0);
  }).catch(err => {
    console.error('\n❌ Test script failed:', err);
    process.exit(1);
  });
}, 2000);
