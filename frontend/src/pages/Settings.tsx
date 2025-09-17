import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  CameraIcon,
  SpeakerWaveIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    systemName: 'SADS Main System',
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
    }
  });

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

  const settingSections = [
    {
      title: 'System Settings',
      icon: Cog6ToothIcon,
      color: 'text-blue-600 bg-blue-100',
      settings: [
        {
          key: 'systemName',
          label: 'System Name',
          type: 'text',
          value: settings.systemName,
          onChange: (value: string) => setSettings(prev => ({ ...prev, systemName: value }))
        },
        {
          key: 'detectionSensitivity',
          label: 'Detection Sensitivity',
          type: 'select',
          value: settings.detectionSensitivity,
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ],
          onChange: (value: string) => setSettings(prev => ({ ...prev, detectionSensitivity: value }))
        }
      ]
    },
    {
      title: 'Deterrent Settings',
      icon: ShieldCheckIcon,
      color: 'text-green-600 bg-green-100',
      settings: [
        {
          key: 'sound',
          label: 'Sound Deterrent',
          type: 'toggle',
          value: settings.deterrentTypes.sound,
          onChange: (value: boolean) => handleSettingChange('deterrentTypes', 'sound', value)
        },
        {
          key: 'light',
          label: 'Light Deterrent',
          type: 'toggle',
          value: settings.deterrentTypes.light,
          onChange: (value: boolean) => handleSettingChange('deterrentTypes', 'light', value)
        },
        {
          key: 'water',
          label: 'Water Deterrent',
          type: 'toggle',
          value: settings.deterrentTypes.water,
          onChange: (value: boolean) => handleSettingChange('deterrentTypes', 'water', value)
        }
      ]
    },
    {
      title: 'Notification Settings',
      icon: BellIcon,
      color: 'text-purple-600 bg-purple-100',
      settings: [
        {
          key: 'email',
          label: 'Email Notifications',
          type: 'toggle',
          value: settings.notifications.email,
          onChange: (value: boolean) => handleSettingChange('notifications', 'email', value)
        },
        {
          key: 'sms',
          label: 'SMS Notifications',
          type: 'toggle',
          value: settings.notifications.sms,
          onChange: (value: boolean) => handleSettingChange('notifications', 'sms', value)
        },
        {
          key: 'push',
          label: 'Push Notifications',
          type: 'toggle',
          value: settings.notifications.push,
          onChange: (value: boolean) => handleSettingChange('notifications', 'push', value)
        }
      ]
    },
    {
      title: 'Camera Settings',
      icon: CameraIcon,
      color: 'text-indigo-600 bg-indigo-100',
      settings: [
        {
          key: 'resolution',
          label: 'Camera Resolution',
          type: 'select',
          value: settings.cameraSettings.resolution,
          options: [
            { value: '720p', label: '720p' },
            { value: '1080p', label: '1080p' },
            { value: '4K', label: '4K' }
          ],
          onChange: (value: string) => handleSettingChange('cameraSettings', 'resolution', value)
        },
        {
          key: 'nightVision',
          label: 'Night Vision',
          type: 'toggle',
          value: settings.cameraSettings.nightVision,
          onChange: (value: boolean) => handleSettingChange('cameraSettings', 'nightVision', value)
        },
        {
          key: 'motionDetection',
          label: 'Motion Detection',
          type: 'toggle',
          value: settings.cameraSettings.motionDetection,
          onChange: (value: boolean) => handleSettingChange('cameraSettings', 'motionDetection', value)
        }
      ]
    }
  ];

  const renderSettingInput = (setting: any) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => setting.onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => setting.onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {setting.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'toggle':
        return (
          <button
            onClick={() => setting.onChange(!setting.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              setting.value ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your SADS system preferences and behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-3 rounded-xl ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {setting.label}
                  </label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Schedule Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-100">
            <ClockIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Schedule Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Hours
            </label>
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
            <label className="text-sm font-medium text-gray-700">
              Weekend Mode
            </label>
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

export default Settings;
