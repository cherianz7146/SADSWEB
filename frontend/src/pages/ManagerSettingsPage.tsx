import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  BellIcon,
  CameraIcon,
  SpeakerWaveIcon,
  LightBulbIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

const ManagerSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState({
    systemName: 'SADS Manager System',
    detectionSensitivity: 'medium',
    deterrentTypes: {
      sound: true,
      light: true,
      water: false,
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    cameraSettings: {
      resolution: '1080p',
      nightVision: true,
      motionDetection: true,
    },
    scheduleSettings: {
      activeHours: '06:00-22:00',
      weekendMode: false,
    },
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      timezone: 'UTC-5',
    },
    security: {
      twoFactor: false,
      sessionTimeout: 60,
      passwordChange: false,
    }
  });

  const tabs = [
    { id: 'system', label: 'System Settings', icon: Cog6ToothIcon },
    { id: 'deterrents', label: 'Deterrent Settings', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'cameras', label: 'Camera Settings', icon: CameraIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General System Settings</h3>
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detection Sensitivity</label>
            <select
              value={settings.detectionSensitivity}
              onChange={(e) => setSettings(prev => ({ ...prev, detectionSensitivity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low - Fewer false positives</option>
              <option value="medium">Medium - Balanced detection</option>
              <option value="high">High - Maximum sensitivity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Hours</label>
            <input
              type="text"
              value={settings.scheduleSettings.activeHours}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                scheduleSettings: { ...prev.scheduleSettings, activeHours: e.target.value }
              }))}
              placeholder="06:00-22:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Weekend Mode</label>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                scheduleSettings: { ...prev.scheduleSettings, weekendMode: !prev.scheduleSettings.weekendMode }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.scheduleSettings.weekendMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.scheduleSettings.weekendMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeterrentSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deterrent Types</h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SpeakerWaveIcon className="h-6 w-6 text-blue-600" />
              <div>
                <label className="text-sm font-medium text-gray-700">Sound Deterrent</label>
                <p className="text-xs text-gray-500">Audio alerts and warning sounds</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('deterrentTypes', 'sound', !settings.deterrentTypes.sound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.deterrentTypes.sound ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.deterrentTypes.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
      </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LightBulbIcon className="h-6 w-6 text-yellow-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">Light Deterrent</label>
                <p className="text-xs text-gray-500">Strobe lights and visual alerts</p>
            </div>
            </div>
            <button
              onClick={() => handleSettingChange('deterrentTypes', 'light', !settings.deterrentTypes.light)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.deterrentTypes.light ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.deterrentTypes.light ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-6 w-6 text-blue-600" />
          <div>
                <label className="text-sm font-medium text-gray-700">Water Deterrent</label>
                <p className="text-xs text-gray-500">Water spray deterrents (if available)</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('deterrentTypes', 'water', !settings.deterrentTypes.water)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.deterrentTypes.water ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.deterrentTypes.water ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deterrent Configuration</h3>
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activation Threshold</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.1"
              defaultValue="0.8"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (0.5)</span>
              <span>High (1.0)</span>
            </div>
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deterrent Duration (seconds)</label>
            <input
              type="number"
              min="5"
              max="120"
              defaultValue="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-blue-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive alerts via email</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-xs text-gray-500">Receive alerts via SMS</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'sms', !settings.notifications.sms)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.sms ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-purple-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Browser push notifications</p>
            </div>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" defaultValue="22:00" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" defaultValue="07:00" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCameraSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Camera Resolution</label>
            <select
              value={settings.cameraSettings.resolution}
              onChange={(e) => handleSettingChange('cameraSettings', 'resolution', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="4K">4K Ultra HD</option>
            </select>
      </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CameraIcon className="h-6 w-6 text-indigo-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">Night Vision</label>
                <p className="text-xs text-gray-500">Enable infrared night vision</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('cameraSettings', 'nightVision', !settings.cameraSettings.nightVision)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.cameraSettings.nightVision ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.cameraSettings.nightVision ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CameraIcon className="h-6 w-6 text-green-600" />
            <div>
                <label className="text-sm font-medium text-gray-700">Motion Detection</label>
                <p className="text-xs text-gray-500">Enable motion-based recording</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('cameraSettings', 'motionDetection', !settings.cameraSettings.motionDetection)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.cameraSettings.motionDetection ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.cameraSettings.motionDetection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.profile.timezone}
              onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="UTC-5">UTC-5 (Eastern Time)</option>
              <option value="UTC-6">UTC-6 (Central Time)</option>
              <option value="UTC-7">UTC-7 (Mountain Time)</option>
              <option value="UTC-8">UTC-8 (Pacific Time)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <KeyIcon className="h-6 w-6 text-green-600" />
          <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactor ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              min="15"
              max="480"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
      </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <KeyIcon className="h-6 w-6 text-orange-600" />
              <div>
                <label className="text-sm font-medium text-gray-700">Force Password Change</label>
                <p className="text-xs text-gray-500">Require password change on next login</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('security', 'passwordChange', !settings.security.passwordChange)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.passwordChange ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.passwordChange ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input 
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'system': return renderSystemSettings();
      case 'deterrents': return renderDeterrentSettings();
      case 'notifications': return renderNotificationSettings();
      case 'cameras': return renderCameraSettings();
      case 'profile': return renderProfileSettings();
      case 'security': return renderSecuritySettings();
      default: return renderSystemSettings();
    }
  };

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your SADS system preferences and behavior</p>
      </div>

      <div className="flex space-x-1 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default ManagerSettingsPage;