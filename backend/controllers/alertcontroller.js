const User = require('../models/user');
const { sendTestAlert, sendSMS, sendWhatsApp, makeCall } = require('../services/twilioservice');

/**
 * Send test alert to user's phone
 */
exports.sendTest = async (req, res) => {
  try {
    const { channel } = req.body; // 'sms', 'whatsapp', or 'call'
    const user = await User.findById(req.user.id);

    if (!user.phone) {
      return res.status(400).json({ message: 'Please add a phone number first' });
    }

    const result = await sendTestAlert(user.phone, channel || 'sms');

    if (result.success) {
      return res.json({ 
        message: `Test ${channel || 'SMS'} sent successfully!`,
        result 
      });
    } else {
      return res.status(500).json({ 
        message: `Failed to send test ${channel || 'SMS'}`,
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test alert:', error);
    return res.status(500).json({ message: 'Failed to send test alert', error: error.message });
  }
};

/**
 * Update user's phone number
 */
exports.updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone format (E.164)
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' 
      });
    }

    const user = await User.findById(req.user.id);
    user.phone = phone;
    await user.save();

    return res.json({ 
      message: 'Phone number updated successfully',
      phone: user.phone 
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    return res.status(500).json({ message: 'Failed to update phone number', error: error.message });
  }
};

/**
 * Update user's alert preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { enableSMS, enableWhatsApp, enableCalls, criticalOnly, quietHours } = req.body;

    const user = await User.findById(req.user.id);
    
    // Update preferences
    if (enableSMS !== undefined) user.alertPreferences.enableSMS = enableSMS;
    if (enableWhatsApp !== undefined) user.alertPreferences.enableWhatsApp = enableWhatsApp;
    if (enableCalls !== undefined) user.alertPreferences.enableCalls = enableCalls;
    if (criticalOnly !== undefined) user.alertPreferences.criticalOnly = criticalOnly;
    
    if (quietHours) {
      if (quietHours.enabled !== undefined) {
        user.alertPreferences.quietHours.enabled = quietHours.enabled;
      }
      if (quietHours.start) user.alertPreferences.quietHours.start = quietHours.start;
      if (quietHours.end) user.alertPreferences.quietHours.end = quietHours.end;
    }

    await user.save();

    return res.json({ 
      message: 'Alert preferences updated successfully',
      alertPreferences: user.alertPreferences 
    });
  } catch (error) {
    console.error('Error updating alert preferences:', error);
    return res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
};

/**
 * Get user's alert settings
 */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('phone alertPreferences');

    return res.json({ 
      phone: user.phone,
      alertPreferences: user.alertPreferences || {
        enableSMS: true,
        enableWhatsApp: true,
        enableCalls: true,
        criticalOnly: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      }
    });
  } catch (error) {
    console.error('Error getting alert settings:', error);
    return res.status(500).json({ message: 'Failed to get settings', error: error.message });
  }
};

/**
 * Admin: Send custom alert to manager(s)
 */
exports.sendCustomAlert = async (req, res) => {
  try {
    // Only admins can send custom alerts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { managerIds, message, channel } = req.body;

    if (!managerIds || !Array.isArray(managerIds) || managerIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one manager' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const managers = await User.find({ _id: { $in: managerIds } });
    const results = [];

    for (const manager of managers) {
      if (!manager.phone) {
        results.push({
          manager: manager.name,
          success: false,
          error: 'No phone number'
        });
        continue;
      }

      let result;
      switch (channel) {
        case 'whatsapp':
          result = await sendWhatsApp(manager.phone, message);
          break;
        case 'call':
          result = await makeCall(manager.phone, message);
          break;
        default:
          result = await sendSMS(manager.phone, message);
      }

      results.push({
        manager: manager.name,
        ...result
      });
    }

    return res.json({ 
      message: 'Alerts sent',
      results 
    });
  } catch (error) {
    console.error('Error sending custom alert:', error);
    return res.status(500).json({ message: 'Failed to send alerts', error: error.message });
  }
};



