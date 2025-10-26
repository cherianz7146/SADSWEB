require('dotenv').config(); // Load environment variables
const { sendWelcomeEmail } = require('./services/emailservices');
const nodemailer = require('nodemailer');

console.log('=== SADS Email Configuration Test ===');
console.log('SMTP Configuration:');
console.log('- Host:', process.env.SMTP_HOST || 'Not set');
console.log('- Port:', process.env.SMTP_PORT || 'Not set');
console.log('- User:', process.env.SMTP_USER ? '*** Configured ***' : 'Not set');
console.log('- Pass:', process.env.SMTP_PASS ? '*** Configured ***' : 'Not set');
console.log('- From:', process.env.MAIL_FROM || 'Not set');
console.log('');

// Test user object
const testUser = {
  name: 'Test User',
  email: process.env.TEST_EMAIL || process.env.SMTP_USER || 'test@example.com',
  role: 'manager'
};

// Test SMTP connection
async function testSMTPConnection() {
  console.log('Testing SMTP connection...');
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ SMTP configuration incomplete. Please check your .env file.');
    console.log('Required fields: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    return false;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transport.verify();
    console.log('✅ SMTP connection successful!');
    return true;
  } catch (err) {
    console.log('❌ SMTP connection failed:', err.message);
    
    if (err.message.includes('Username and Password not accepted')) {
      console.log('\n💡 Fix suggestion:');
      console.log('1. Enable 2-Factor Authentication on your Google Account');
      console.log('2. Generate an App Password for "Mail"');
      console.log('3. Use the App Password instead of your regular Gmail password');
      console.log('4. Update your .env file with the App Password');
      console.log('More info: https://support.google.com/accounts/answer/185833');
    }
    
    return false;
  }
}

// Test email sending
async function testEmailSending() {
  console.log('\nTesting welcome email sending...');
  
  try {
    await sendWelcomeEmail(testUser);
    console.log('✅ Welcome email test completed successfully!');
    return true;
  } catch (err) {
    console.log('❌ Welcome email test failed:', err.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const isConnected = await testSMTPConnection();
  
  if (isConnected) {
    await testEmailSending();
    console.log('\n=== Test Summary ===');
    console.log('✅ SMTP is properly configured and ready to send emails!');
    console.log('📧 New users will now receive welcome emails.');
  } else {
    console.log('\n=== Test Summary ===');
    console.log('❌ SMTP configuration needs to be fixed before emails can be sent.');
  }
}

runTests();