import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BellIcon,
  UserIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import UserSidebar from '../components/UserSidebar';

interface DeviceHealthStats {
  totalDevices: number;
  healthy: number;
  warning: number;
  critical: number;
  averageHealthScore: number;
  devices: Array<{
    _id: string;
    serialNumber: string;
    type: string;
    status: string;
    batteryLevel: number;
    signalStrength: number;
    assignedProperty: {
      _id: string;
      name: string;
    };
    lastPing: string;
  }>;
}

const DeviceHealthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DeviceHealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchDeviceHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<DeviceHealthStats>('/api/devices/health');
        if (response.data) {
          setStats(response.data);
        } else {
          setError('Failed to load device health data');
        }
      } catch (err: any) {
        console.error('Error fetching device health:', err);
        setError(err.message || 'Failed to load device health');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDeviceHealth();
    }
  }, [user]);

  const getHealthStatus = (device: DeviceHealthStats['devices'][0]) => {
    const now = new Date();
    const lastPing = new Date(device.lastPing);
    const minutesSincePing = (now.getTime() - lastPing.getTime()) / (1000 * 60);

    if (device.status === 'offline' || minutesSincePing > 30) {
      return 'critical';
    } else if (device.batteryLevel < 20 || device.signalStrength < 30 || minutesSincePing > 10) {
      return 'warning';
    }
    return 'healthy';
  };

  const filteredDevices = stats?.devices.filter(device => {
    if (selectedProperty !== 'all' && device.assignedProperty._id !== selectedProperty) {
      return false;
    }
    if (selectedStatus !== 'all') {
      const healthStatus = getHealthStatus(device);
      if (selectedStatus !== healthStatus) {
        return false;
      }
    }
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading device health...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Failed to load device health data'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const healthyPercentage = stats.totalDevices > 0 ? Math.round((stats.healthy / stats.totalDevices) * 100) : 0;
  const warningPercentage = stats.totalDevices > 0 ? Math.round((stats.warning / stats.totalDevices) * 100) : 0;
  const criticalPercentage = stats.totalDevices > 0 ? Math.round((stats.critical / stats.totalDevices) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Device Health Monitoring</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
                </button>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-700 font-medium">{user?.name || 'User'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* IoT Device Health Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">IoT Device Health</h2>
                <p className="text-gray-600">Monitor the health and status of all IoT devices</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Properties</option>
                  {/* Add property options here if needed */}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <HeartIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDevices}</div>
                <div className="text-sm text-gray-600">Total Devices</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.healthy}</div>
                <div className="text-sm text-gray-600">Healthy</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.warning}</div>
                <div className="text-sm text-gray-600">Warning</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.critical}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Average System Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Average System Health Score</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.averageHealthScore / 100)}`}
                    className="text-emerald-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{stats.averageHealthScore}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 mb-4">
                  Overall system health is excellent. {stats.healthy} of {stats.totalDevices} devices are operating at optimal performance.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Healthy: {healthyPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Warning: {warningPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Critical: {criticalPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Device Health Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Device Health Status</h2>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                <span>Add Device</span>
              </button>
            </div>
            
            {/* Device List Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        No devices found
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => {
                      const healthStatus = getHealthStatus(device);
                      return (
                        <tr key={device._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {device.serialNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {device.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.assignedProperty?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                              healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.batteryLevel}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.signalStrength}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(device.lastPing).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DeviceHealthPage;





