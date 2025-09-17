import React from 'react';
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { label: 'My Plantation', value: 'Plantation A', icon: MapPinIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Cameras', value: '8', icon: CameraIcon, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Wildlife Detections', value: '156', icon: ExclamationTriangleIcon, color: 'text-orange-600 bg-orange-100' },
    { label: 'Deterrent Activations', value: '23', icon: ShieldCheckIcon, color: 'text-red-600 bg-red-100' },
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantation Manager Dashboard</h1>
            <p className="text-gray-600">Monitor wildlife deterrent systems for your plantation</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{user?.name}</p>
                <p className="text-xs text-blue-600">Plantation Manager</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
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
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plantation Fields */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Plantation Fields Status</h2>
          <div className="space-y-4">
            {plantationStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{stat.field}</p>
                  <p className="text-sm text-gray-500">{stat.detections} detections</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stat.deterrents} deterrents</p>
                  <p className={`text-xs font-medium ${
                    stat.status === 'Active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>{stat.status}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <p className={`text-sm ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/dashboard/camera-feeds')}
            className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <CameraIcon className="h-6 w-6" />
            <span className="font-medium">View Camera Feeds</span>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/reports')}
            className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="font-medium">View Reports</span>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="flex items-center space-x-3 p-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
          >
            <ExclamationTriangleIcon className="h-6 w-6" />
            <span className="font-medium">Check Alerts</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;

