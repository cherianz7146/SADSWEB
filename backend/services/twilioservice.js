const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client = null;

// Initialize client only if credentials are provided
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized');
} else {
  console.warn('⚠️  Twilio credentials not found. SMS/WhatsApp alerts disabled.');
}

/**
 * Send SMS Alert
 * @param {string} to - Phone number (E.164 format: +1234567890)
 * @param {string} message - Message content
 * @returns {Promise<object>} Twilio response
 */
async function sendSMS(to, message) {
  if (!client) {
    console.warn('Twilio not configured. Skipping SMS to:', to);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log(`✅ SMS sent to ${to}:`, result.sid);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp Message
 * @param {string} to - Phone number (E.164 format: +1234567890)
 * @param {string} message - Message content
 * @returns {Promise<object>} Twilio response
 */
async function sendWhatsApp(to, message) {
  if (!client) {
    console.warn('Twilio not configured. Skipping WhatsApp to:', to);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${to}`
    });

    console.log(`✅ WhatsApp sent to ${to}:`, result.sid);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Make Voice Call
 * @param {string} to - Phone number (E.164 format: +1234567890)
 * @param {string} message - Message to speak
 * @returns {Promise<object>} Twilio response
 */
async function makeCall(to, message) {
  if (!client) {
    console.warn('Twilio not configured. Skipping call to:', to);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Create TwiML for text-to-speech
    const twiml = `
      <Response>
        <Say voice="alice" language="en-IN">${message}</Say>
        <Pause length="2"/>
        <Say voice="alice" language="en-IN">Press any key to acknowledge this alert.</Say>
      </Response>
    `;

    const result = await client.calls.create({
      twiml: twiml,
      from: twilioPhoneNumber,
      to: to
    });

    console.log(`✅ Call initiated to ${to}:`, result.sid);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error(`❌ Failed to call ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Critical Alert (SMS + WhatsApp + Call)
 * @param {string} to - Phone number
 * @param {object} detection - Detection data
 * @param {object} user - User data
 * @returns {Promise<object>} Combined results
 */
async function sendCriticalAlert(to, detection, user) {
  const animalType = detection.label.toUpperCase();
  const location = detection.propertyName || detection.location || 'Unknown location';
  const confidence = Math.round(detection.probability * 100);
  const time = new Date(detection.detectedAt).toLocaleString('en-IN');

  // Create message
  const smsMessage = `🚨 CRITICAL ALERT!\n\n${animalType} detected at ${location}\nConfidence: ${confidence}%\nTime: ${time}\n\nTake immediate action!`;
  
  const whatsappMessage = `*🚨 CRITICAL WILDLIFE ALERT*\n\n*Animal:* ${animalType}\n*Location:* ${location}\n*Confidence:* ${confidence}%\n*Detected:* ${time}\n*Manager:* ${user.name}\n\n⚠️ *IMMEDIATE ACTION REQUIRED*\n\nRespond quickly to prevent damage or danger.`;
  
  const voiceMessage = `Critical Alert! ${animalType} detected at ${location}. This is an emergency. Please take immediate action.`;

  // Send all channels
  const results = await Promise.allSettled([
    sendSMS(to, smsMessage),
    sendWhatsApp(to, whatsappMessage),
    makeCall(to, voiceMessage)
  ]);

  return {
    sms: results[0].status === 'fulfilled' ? results[0].value : { success: false },
    whatsapp: results[1].status === 'fulfilled' ? results[1].value : { success: false },
    call: results[2].status === 'fulfilled' ? results[2].value : { success: false }
  };
}

/**
 * Send Warning Alert (SMS + WhatsApp)
 * @param {string} to - Phone number
 * @param {object} detection - Detection data
 * @param {object} user - User data
 * @returns {Promise<object>} Combined results
 */
async function sendWarningAlert(to, detection, user) {
  const animalType = detection.label.toUpperCase();
  const location = detection.propertyName || detection.location || 'Unknown location';
  const confidence = Math.round(detection.probability * 100);
  const time = new Date(detection.detectedAt).toLocaleString('en-IN');

  const smsMessage = `⚠️ WARNING!\n\n${animalType} detected at ${location}\nConfidence: ${confidence}%\nTime: ${time}\n\nMonitor the situation.`;
  
  const whatsappMessage = `*⚠️ WILDLIFE WARNING*\n\n*Animal:* ${animalType}\n*Location:* ${location}\n*Confidence:* ${confidence}%\n*Detected:* ${time}\n*Manager:* ${user.name}\n\nPlease monitor the situation and take action if needed.`;

  // Send SMS and WhatsApp (no call for warnings)
  const results = await Promise.allSettled([
    sendSMS(to, smsMessage),
    sendWhatsApp(to, whatsappMessage)
  ]);

  return {
    sms: results[0].status === 'fulfilled' ? results[0].value : { success: false },
    whatsapp: results[1].status === 'fulfilled' ? results[1].value : { success: false }
  };
}

/**
 * Send Info Alert (SMS only)
 * @param {string} to - Phone number
 * @param {object} detection - Detection data
 * @returns {Promise<object>} SMS result
 */
async function sendInfoAlert(to, detection) {
  const animalType = detection.label.toUpperCase();
  const location = detection.propertyName || detection.location || 'Unknown location';
  const time = new Date(detection.detectedAt).toLocaleString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const message = `ℹ️ Info: ${animalType} detected at ${location} at ${time}`;
  
  return await sendSMS(to, message);
}

/**
 * Determine alert severity and send appropriate alert
 * @param {object} detection - Detection data
 * @param {object} user - User data with phone number
 * @returns {Promise<object>} Alert results
 */
async function sendSmartAlert(detection, user) {
  if (!user.phone) {
    console.warn(`User ${user.name} has no phone number configured`);
    return { success: false, error: 'No phone number configured' };
  }

  const animalType = detection.label.toLowerCase();
  const confidence = detection.probability;

  // Define alert levels
  const criticalAnimals = ['elephant', 'tiger', 'leopard', 'bear', 'lion'];
  const warningAnimals = ['wild boar', 'boar', 'hyena', 'wolf', 'crocodile'];
  
  let result;

  if (criticalAnimals.includes(animalType) && confidence >= 0.80) {
    // CRITICAL: SMS + WhatsApp + Voice Call
    console.log(`🚨 Sending CRITICAL alert for ${animalType}`);
    result = await sendCriticalAlert(user.phone, detection, user);
    result.level = 'critical';
  } else if (warningAnimals.includes(animalType) || confidence >= 0.70) {
    // WARNING: SMS + WhatsApp
    console.log(`⚠️ Sending WARNING alert for ${animalType}`);
    result = await sendWarningAlert(user.phone, detection, user);
    result.level = 'warning';
  } else {
    // INFO: SMS only
    console.log(`ℹ️ Sending INFO alert for ${animalType}`);
    result = await sendInfoAlert(user.phone, detection);
    result.level = 'info';
  }

  return result;
}

/**
 * Send Test Alert
 * @param {string} to - Phone number
 * @param {string} channel - 'sms', 'whatsapp', or 'call'
 * @returns {Promise<object>} Test result
 */
async function sendTestAlert(to, channel = 'sms') {
  const message = 'This is a test alert from SADS (Smart Animal Detection System). Your alert system is working correctly!';

  switch (channel) {
    case 'sms':
      return await sendSMS(to, `📱 ${message}`);
    case 'whatsapp':
      return await sendWhatsApp(to, `*📱 Test Alert*\n\n${message}`);
    case 'call':
      return await makeCall(to, message);
    default:
      return { success: false, error: 'Invalid channel' };
  }
}

module.exports = {
  sendSMS,
  sendWhatsApp,
  makeCall,
  sendCriticalAlert,
  sendWarningAlert,
  sendInfoAlert,
  sendSmartAlert,
  sendTestAlert
};



