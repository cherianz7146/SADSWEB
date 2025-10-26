import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon, 
  BellAlertIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import BackButton from '../components/BackButton';

interface AlertPreferences {
  enableSMS: boolean;
  enableWhatsApp: boolean;
  enableCalls: boolean;
  criticalOnly: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface AlertSettings {
  phone: string;
  alertPreferences: AlertPreferences;
}

const AlertSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    phone: '',
    alertPreferences: {
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiFetch<AlertSettings>('/api/alerts/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePhoneUpdate = async () => {
    if (!settings.phone) {
      showMessage('error', 'Please enter a phone number');
      return;
    }

    // Validate E.164 format
    if (!/^\+?[1-9]\d{1,14}$/.test(settings.phone)) {
      showMessage('error', 'Invalid phone number format. Use E.164 format (e.g., +1234567890)');
      return;
    }

    setSaving(true);
    try {
      await apiFetch('/api/alerts/phone', {
        method: 'PATCH',
        body: { phone: settings.phone }
      });
      showMessage('success', 'Phone number updated successfully!');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update phone number');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/alerts/preferences', {
        method: 'PATCH',
        body: settings.alertPreferences
      });
      showMessage('success', 'Alert preferences updated successfully!');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async (channel: 'sms' | 'whatsapp' | 'call') => {
    if (!settings.phone) {
      showMessage('error', 'Please add and save your phone number first');
      return;
    }

    setTesting(channel);
    try {
      const response = await apiFetch('/api/alerts/test', {
        method: 'POST',
        body: { channel }
      });
      showMessage('success', `Test ${channel.toUpperCase()} sent! Check your phone.`);
    } catch (error: any) {
      showMessage('error', error.message || `Failed to send test ${channel}`);
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alert Settings</h1>
          <p className="text-gray-600">Configure SMS, WhatsApp, and voice call notifications</p>
        </motion.div>

        {/* Alert Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* Phone Number Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <DevicePhoneMobileIcon className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Phone Number</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number (E.164 format)
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+919876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Include country code (e.g., +91 for India, +1 for USA)
              </p>
            </div>

            <button
              onClick={handlePhoneUpdate}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? 'Saving...' : 'Save Phone Number'}
            </button>
          </div>
        </motion.div>

        {/* Alert Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <BellAlertIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Alert Channels</h2>
          </div>

          <div className="space-y-4">
            {/* SMS Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">SMS Messages</p>
                  <p className="text-sm text-gray-500">Receive text message alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.enableSMS}
                  onChange={(e) => setSettings({
                    ...settings,
                    alertPreferences: { ...settings.alertPreferences, enableSMS: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Messages</p>
                  <p className="text-sm text-gray-500">Receive alerts via WhatsApp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.enableWhatsApp}
                  onChange={(e) => setSettings({
                    ...settings,
                    alertPreferences: { ...settings.alertPreferences, enableWhatsApp: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Voice Calls Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Voice Calls</p>
                  <p className="text-sm text-gray-500">Receive calls for critical alerts only</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.enableCalls}
                  onChange={(e) => setSettings({
                    ...settings,
                    alertPreferences: { ...settings.alertPreferences, enableCalls: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Critical Only Toggle */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Critical Alerts Only</p>
                  <p className="text-sm text-gray-500">Only receive alerts for dangerous animals (Elephant, Tiger)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.criticalOnly}
                  onChange={(e) => setSettings({
                    ...settings,
                    alertPreferences: { ...settings.alertPreferences, criticalOnly: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <ClockIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quiet Hours</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Quiet Hours</p>
                <p className="text-sm text-gray-500">Silence non-critical alerts during sleep</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.quietHours.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    alertPreferences: {
                      ...settings.alertPreferences,
                      quietHours: { ...settings.alertPreferences.quietHours, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {settings.alertPreferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={settings.alertPreferences.quietHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      alertPreferences: {
                        ...settings.alertPreferences,
                        quietHours: { ...settings.alertPreferences.quietHours, start: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={settings.alertPreferences.quietHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      alertPreferences: {
                        ...settings.alertPreferences,
                        quietHours: { ...settings.alertPreferences.quietHours, end: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end space-x-4"
        >
          <button
            onClick={handlePreferencesUpdate}
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </motion.div>

        {/* Test Alerts Section */}
        {settings.phone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Your Alerts</h3>
            <p className="text-sm text-gray-600 mb-6">
              Send test messages to verify your alert system is working
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleTestAlert('sms')}
                disabled={testing === 'sms'}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {testing === 'sms' ? 'Sending...' : 'Test SMS'}
              </button>
              <button
                onClick={() => handleTestAlert('whatsapp')}
                disabled={testing === 'whatsapp'}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {testing === 'whatsapp' ? 'Sending...' : 'Test WhatsApp'}
              </button>
              <button
                onClick={() => handleTestAlert('call')}
                disabled={testing === 'call'}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {testing === 'call' ? 'Calling...' : 'Test Call'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Alert Levels Explained</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li><strong>🔴 Critical:</strong> Elephant, Tiger, Leopard → SMS + WhatsApp + Call</li>
                <li><strong>🟡 Warning:</strong> Wild Boar, Hyena → SMS + WhatsApp</li>
                <li><strong>🟢 Info:</strong> Other animals → SMS only</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AlertSettingsPage;


