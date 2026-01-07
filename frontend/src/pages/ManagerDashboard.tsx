import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    properties: { total: 0, active: 0, totalCameras: 0 },
    detections: { today: 0, last24h: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch('/api/stats/manager');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch manager stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const cards = [
    { label: 'My Property', value: stats.properties.total.toString(), icon: MapPinIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Cameras', value: stats.properties.totalCameras.toString(), icon: CameraIcon, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Detections Today', value: stats.detections.today.toString(), icon: ExclamationTriangleIcon, color: 'text-orange-600 bg-orange-100' },
    { label: 'Total Detections', value: stats.detections.total.toString(), icon: ShieldCheckIcon, color: 'text-red-600 bg-red-100' },
  ];

  const recentActivity = [
    { time: '2 min ago', event: 'Tiger detected in Field 1', status: 'Deterrent activated', priority: 'high' },
    { time: '15 min ago', event: 'Wild Boar detected in Field 2', status: 'Monitoring', priority: 'medium' },
    { time: '1 hour ago', event: 'Elephant detected in Field 3', status: 'Deterrent activated', priority: 'high' },
    { time: '3 hours ago', event: 'Deer detected in Field 1', status: 'No action needed', priority: 'low' },
  ];

  const plantationStats = [
    { field: 'Field 1', detections: 45, deterrents: 42, status: 'Active' },
    { field: 'Field 2', detections: 32, deterrents: 30, status: 'Active' },
    { field: 'Field 3', detections: 28, deterrents: 25, status: 'Maintenance' },
    { field: 'Field 4', detections: 15, deterrents: 12, status: 'Active' },
  ];

  return (
    <div className="p-8">
      {/* Welcome Section with Profile */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-blue-100 text-lg">Monitor your property and wildlife detections</p>
                {user?.userId && (
                  <p className="text-blue-200 text-sm mt-1">User ID: {user.userId}</p>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-blue-100">Your Property</p>
                <p className="text-2xl font-bold">{stats.properties.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
              </div>
              <div className={`p-4 rounded-xl ${card.color}`}>
                <card.icon className="h-8 w-8" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Property Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Property Status</h2>
          </div>
          <div className="space-y-4">
            {plantationStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{stat.field}</p>
                  <p className="text-sm text-gray-500">{stat.detections} detections</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stat.detections} detections</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    stat.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {stat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${
                  activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <p className={`text-sm font-medium ${
                    activity.status.includes('activated') ? 'text-red-600' :
                    activity.status.includes('Monitoring') ? 'text-yellow-600' : 'text-green-600'
                  }`}>{activity.status}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/dashboard/properties')}
            className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all duration-200 hover:scale-105 border border-blue-200"
          >
            <MapPinIcon className="h-6 w-6" />
            <div className="text-left">
              <span className="font-medium block">Property</span>
              <span className="text-xs text-blue-600">View your property</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/detection-report')}
            className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all duration-200 hover:scale-105 border border-green-200"
          >
            <ChartBarIcon className="h-6 w-6" />
            <div className="text-left">
              <span className="font-medium block">Reports</span>
              <span className="text-xs text-green-600">View analytics</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="flex items-center space-x-3 p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-all duration-200 hover:scale-105 border border-orange-200"
          >
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div className="text-left">
              <span className="font-medium block">Alerts</span>
              <span className="text-xs text-orange-600">Check notifications</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all duration-200 hover:scale-105 border border-purple-200"
          >
            <Cog6ToothIcon className="h-6 w-6" />
            <div className="text-left">
              <span className="font-medium block">Settings</span>
              <span className="text-xs text-purple-600">Configure system</span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;

