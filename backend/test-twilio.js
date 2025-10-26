/**
 * Twilio SMS/WhatsApp Test Script
 * Tests if Twilio is properly configured and can send messages
 */

require('dotenv').config();
const { sendSMS, sendWhatsApp } = require('./services/twilioservice');

// REPLACE THIS WITH THE PHONE NUMBER YOU WANT TO TEST
// Make sure this number is:
// 1. Verified in Twilio Console (for SMS)
// 2. Joined WhatsApp Sandbox (for WhatsApp)
const TEST_PHONE_NUMBER = '+917306901750'; // ← Your verified number

async function testTwilio() {
  console.log('🧪 Testing Twilio Configuration...\n');
  
  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log('  Account SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('  Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('  Phone Number:', process.env.TWILIO_PHONE_NUMBER || '❌ Missing');
  console.log('  WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER || '❌ Missing');
  console.log('');
  
  // Test phone number format
  console.log('📱 Test Phone Number:', TEST_PHONE_NUMBER);
  if (!/^\+[1-9]\d{1,14}$/.test(TEST_PHONE_NUMBER)) {
    console.log('  ❌ Invalid format! Must be E.164 format (e.g., +919876543210)');
    console.log('  Please update TEST_PHONE_NUMBER in this script.\n');
    return;
  } else {
    console.log('  ✅ Format is valid\n');
  }
  
  // Test SMS
  console.log('📤 Testing SMS...');
  const testSmsMessage = '🧪 This is a test SMS from SADS! If you received this, SMS is working! 🎉';
  try {
    const smsResult = await sendSMS(TEST_PHONE_NUMBER, testSmsMessage);
    if (smsResult.success) {
      console.log('  ✅ SMS sent successfully!');
      console.log('  Message SID:', smsResult.sid);
    } else {
      console.log('  ❌ SMS failed:', smsResult.error);
      if (smsResult.error && smsResult.error.includes('unverified')) {
        console.log('  ⚠️  This phone number is NOT VERIFIED in Twilio Console!');
        console.log('  Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      }
    }
  } catch (error) {
    console.log('  ❌ SMS error:', error.message);
  }
  console.log('');
  
  // Test WhatsApp
  console.log('📤 Testing WhatsApp...');
  const testWhatsAppMessage = '*🧪 Test WhatsApp Message*\n\nThis is a test from SADS!\n\nIf you received this, WhatsApp is working! 🎉';
  try {
    const whatsappResult = await sendWhatsApp(TEST_PHONE_NUMBER, testWhatsAppMessage);
    if (whatsappResult.success) {
      console.log('  ✅ WhatsApp sent successfully!');
      console.log('  Message SID:', whatsappResult.sid);
    } else {
      console.log('  ❌ WhatsApp failed:', whatsappResult.error);
      if (whatsappResult.error && whatsappResult.error.includes('unverified')) {
        console.log('  ⚠️  This phone number is NOT VERIFIED in Twilio Console!');
        console.log('  Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      }
    }
  } catch (error) {
    console.log('  ❌ WhatsApp error:', error.message);
  }
  console.log('');
  
  console.log('🏁 Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. If you see "unverified" errors, verify your phone in Twilio Console');
  console.log('2. Make sure TEST_PHONE_NUMBER in this script matches your verified number');
  console.log('3. Re-run this test after verifying: node test-twilio.js');
  console.log('4. Once tests pass, try registration again with the verified number');
}

// Run the test
testTwilio().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});

