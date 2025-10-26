/**
 * Test script to verify status change email notification
 */

require('dotenv').config();
const { notifyManagerStatusChange } = require('./services/emailservices');

// Mock manager object
const mockManager = {
  _id: '507f1f77bcf86cd799439011',
  userId: '001',
  name: 'Test Manager',
  email: 'jomygeorge2026@mca.ajce.in', // Replace with actual manager email
  role: 'manager',
  isActive: false
};

// Mock admin object
const mockAdmin = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Admin',
  email: 'abelroyroy21@gmail.com', // Replace with actual admin email
  role: 'admin'
};

console.log('========================================');
console.log('TESTING STATUS CHANGE EMAIL');
console.log('========================================\n');

console.log('Test Case 1: Blocking a manager');
console.log('Manager:', mockManager.name, '(' + mockManager.email + ')');
console.log('Admin:', mockAdmin.name, '(' + mockAdmin.email + ')');
console.log('New Status: BLOCKED\n');

// Test blocking
notifyManagerStatusChange(mockManager, mockAdmin, false)
  .then(() => {
    console.log('\n✅ Test Case 1 PASSED: Block email sent successfully\n');
    
    // Test activating
    console.log('========================================');
    console.log('Test Case 2: Activating a manager');
    console.log('New Status: ACTIVATED\n');
    
    return notifyManagerStatusChange(mockManager, mockAdmin, true);
  })
  .then(() => {
    console.log('\n✅ Test Case 2 PASSED: Activation email sent successfully\n');
    console.log('========================================');
    console.log('ALL TESTS PASSED!');
    console.log('========================================\n');
    console.log('Please check the email inbox for:');
    console.log('  ' + mockManager.email);
    console.log('\nYou should receive 2 emails:');
    console.log('  1. Account Blocked notification');
    console.log('  2. Account Activated notification');
    console.log('========================================\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Error details:', error);
    console.log('\n========================================');
    console.log('TROUBLESHOOTING:');
    console.log('========================================');
    console.log('1. Check SMTP configuration in .env:');
    console.log('   SMTP_HOST=' + (process.env.SMTP_HOST || 'NOT SET'));
    console.log('   SMTP_PORT=' + (process.env.SMTP_PORT || 'NOT SET'));
    console.log('   SMTP_USER=' + (process.env.SMTP_USER ? 'SET' : 'NOT SET'));
    console.log('   SMTP_PASS=' + (process.env.SMTP_PASS ? 'SET' : 'NOT SET'));
    console.log('\n2. If using Gmail:');
    console.log('   - Enable "Less secure app access" OR');
    console.log('   - Use "App Password" instead of regular password');
    console.log('\n3. Check firewall settings');
    console.log('========================================\n');
    process.exit(1);
  });





