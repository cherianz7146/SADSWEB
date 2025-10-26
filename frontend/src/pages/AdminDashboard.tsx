import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { 
  CameraIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  ChartBarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import Detector from '../components/Detector';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, managers: 0 },
    properties: { total: 0, active: 0, totalCameras: 0 },
    detections: { today: 0, last24h: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch('/api/stats/admin');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      label: 'Total Managers',
      value: stats.users.managers.toString(),
      icon: UsersIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Active Cameras',
      value: stats.properties.totalCameras.toString(),
      icon: CameraIcon,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      label: 'Managers',
      value: stats.users.managers.toString(),
      icon: UsersIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'Detections Today',
      value: stats.detections.today.toString(),
      icon: ShieldCheckIcon,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const recentActivity = [
    { time: '2 min ago', event: 'Deer detected at Property A', status: 'Deterrent activated' },
    { time: '15 min ago', event: 'Squirrel detected at Property B', status: 'Warning sound played' },
    { time: '1 hour ago', event: 'Raccoon detected at Property C', status: 'Light deterrent activated' },
    { time: '3 hours ago', event: 'System maintenance completed', status: 'All systems operational' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BellIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                  <p className="text-emerald-100 text-lg">Here's what's happening with your SADS system today</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm text-emerald-100">System Status</p>
                    <p className="text-2xl font-bold">All Systems Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* System Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">All Systems Online</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Camera Network</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Online</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">AI Detection</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Detection System</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Ready</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Notifications</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">Configured</span>
                </div>
              </div>
            </div>

            {/* Live Camera Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Live Camera Feed</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600">{cameraEnabled ? 'Live' : 'Offline'}</span>
                  </div>
                  <button
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cameraEnabled 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {cameraEnabled ? 'Stop Camera' : 'Start Camera'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Detector 
                  enabled={cameraEnabled} 
                  onDetection={(event) => console.log('Detection:', event)} 
                />
                {!cameraEnabled && (
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Camera is offline</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                    <div className="flex-shrink-0 w-3 h-3 bg-emerald-500 rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                      <p className="text-sm text-emerald-600 font-medium">{activity.status}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/admin/managers')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all duration-200 hover:scale-105 border border-purple-200"
                >
                  <UsersIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">Manage Managers</span>
                    <span className="text-xs text-purple-600">View & assign managers</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/detection-report')}
                  className="flex items-center space-x-3 p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-all duration-200 hover:scale-105 border border-orange-200"
                >
                  <ChartBarIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">View Reports</span>
                    <span className="text-xs text-orange-600">Analytics & insights</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="flex items-center space-x-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all duration-200 hover:scale-105 border border-emerald-200"
                >
                  <BellIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">Notifications</span>
                    <span className="text-xs text-emerald-600">System alerts</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;