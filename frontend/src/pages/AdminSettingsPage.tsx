import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { 
  Cog6ToothIcon, 
  DevicePhoneMobileIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SaveIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  deviceTimeout: number;
  detectionSensitivity: number;
  deterrentDuration: number;
  alertThreshold: number;
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'devices' | 'alerts'>('system');
  const [settings, setSettings] = useState<SystemSettings>({
    deviceTimeout: 30,
    detectionSensitivity: 75,
    deterrentDuration: 10,
    alertThreshold: 5,
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      deviceTimeout: 30,
      detectionSensitivity: 75,
      deterrentDuration: 10,
      alertThreshold: 5,
      maintenanceMode: false,
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure system settings and operational parameters</p>
        </div>
        <BackButton />
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
              System Settings
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DevicePhoneMobileIcon className="h-5 w-5 inline mr-2" />
              Device Settings
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
              Alert Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detection Sensitivity (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.detectionSensitivity}
                    onChange={(e) => handleSettingChange('detectionSensitivity', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span className="font-medium">{settings.detectionSensitivity}%</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deterrent Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.deterrentDuration}
                    onChange={(e) => handleSettingChange('deterrentDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.deviceTimeout}
                    onChange={(e) => handleSettingChange('deviceTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Threshold (detections/hour)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.alertThreshold}
                    onChange={(e) => handleSettingChange('alertThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">System Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Maintenance Mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Automatic Backup</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Device Management</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Connected Devices</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Camera 1 - Field A</p>
                        <p className="text-sm text-gray-500">Online • Last seen 2 minutes ago</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">Camera 2 - Field B</p>
                        <p className="text-sm text-gray-500">Maintenance • Last seen 1 hour ago</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                      Maintenance
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">Camera 3 - Field C</p>
                        <p className="text-sm text-gray-500">Offline • Last seen 3 hours ago</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      Offline
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Alert Configuration</h2>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Alert Settings</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Configure alert thresholds and notification preferences to ensure timely responses to system events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshIcon className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="text-sm text-orange-600 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <SaveIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
