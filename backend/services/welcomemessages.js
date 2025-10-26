const { sendSMS, sendWhatsApp } = require('./twilioservice');
const { sendWelcomeEmail } = require('./emailservices');

/**
 * Send Welcome SMS
 * @param {object} user - User object with phone, name, userId
 * @returns {Promise<object>} SMS result
 */
async function sendWelcomeSMS(user) {
  if (!user.phone) {
    console.log('No phone number for SMS welcome message');
    return { success: false, reason: 'No phone number' };
  }

  const message = `🎉 Welcome to SADS!

Hi ${user.name}!

Your account has been created successfully.

📝 Your User ID: ${user.userId}

This ID will identify all your wildlife detections.

🦁 Start protecting your property now!

- SADS Team`;

  try {
    const result = await sendSMS(user.phone, message);
    if (result.success) {
      console.log(`✅ Welcome SMS sent to ${user.name} at ${user.phone}`);
    }
    return result;
  } catch (error) {
    console.error(`Failed to send welcome SMS to ${user.phone}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Welcome WhatsApp Message
 * @param {object} user - User object with phone, name, userId
 * @returns {Promise<object>} WhatsApp result
 */
async function sendWelcomeWhatsApp(user) {
  if (!user.phone) {
    console.log('No phone number for WhatsApp welcome message');
    return { success: false, reason: 'No phone number' };
  }

  const message = `*🎉 Welcome to SADS!*

Hi *${user.name}*! 👋

Your account has been *successfully created*.

*📝 Your User ID:* ${user.userId}

This unique ID will identify all your wildlife detections and reports.

*🔐 Account Details:*
• Name: ${user.name}
• Email: ${user.email}
• Role: ${user.role === 'admin' ? 'Administrator' : 'Manager'}
${user.plantation?.name ? `• Property: ${user.plantation.name}` : ''}

*🦁 What's Next?*
1. Login to your dashboard
2. Set up camera detection
3. Configure alert preferences
4. Start protecting your property!

*📱 SMS/WhatsApp Alerts:*
${user.alertPreferences?.enableSMS ? '✅ SMS alerts enabled' : '❌ SMS alerts disabled'}
${user.alertPreferences?.enableWhatsApp ? '✅ WhatsApp alerts enabled' : '❌ WhatsApp alerts disabled'}
${user.alertPreferences?.enableCalls ? '✅ Voice calls enabled' : '❌ Voice calls disabled'}

You'll receive instant alerts when dangerous animals are detected! 🐘🐯

*Need Help?*
Reply to this message or contact us at support@sads.com

Welcome aboard! 🚀

- *SADS Team*
_Smart Animal Deterrent System_`;

  try {
    const result = await sendWhatsApp(user.phone, message);
    if (result.success) {
      console.log(`✅ Welcome WhatsApp sent to ${user.name} at ${user.phone}`);
    }
    return result;
  } catch (error) {
    console.error(`Failed to send welcome WhatsApp to ${user.phone}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Complete Welcome Package (Email + SMS + WhatsApp)
 * @param {object} user - User object
 * @returns {Promise<object>} Results from all channels
 */
async function sendCompleteWelcome(user) {
  console.log(`📨 Sending welcome package to ${user.name} (${user.email})`);
  
  const results = {
    email: { success: false },
    sms: { success: false },
    whatsapp: { success: false }
  };

  // Send Email (always)
  try {
    await sendWelcomeEmail(user);
    results.email.success = true;
    console.log('✅ Welcome email sent');
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    results.email.error = error.message;
  }

  // Send SMS and WhatsApp (only if phone number exists)
  if (user.phone) {
    // Send SMS
    try {
      results.sms = await sendWelcomeSMS(user);
    } catch (error) {
      console.error('❌ Welcome SMS failed:', error.message);
      results.sms.error = error.message;
    }

    // Send WhatsApp
    try {
      results.whatsapp = await sendWelcomeWhatsApp(user);
    } catch (error) {
      console.error('❌ Welcome WhatsApp failed:', error.message);
      results.whatsapp.error = error.message;
    }
  } else {
    console.log('ℹ️  No phone number - skipping SMS and WhatsApp');
  }

  // Log summary
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalChannels = user.phone ? 3 : 1;
  console.log(`📊 Welcome package: ${successCount}/${totalChannels} channels successful`);

  return results;
}

module.exports = {
  sendWelcomeSMS,
  sendWelcomeWhatsApp,
  sendCompleteWelcome
};



