import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

interface Notification {
  id: string;
  type: 'detection' | 'system';
  title: string;
  message: string;
  timestamp: string;
  location: string;
  animal?: string;
  confidence?: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'detection',
      title: 'Animal Detected',
      message: 'Tiger detected near Zone A.',
      timestamp: '2 minutes ago',
      location: 'Zone A - Forest Edge',
      animal: 'Tiger',
      confidence: '95%',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'detection',
      title: 'Wild Boar Detected',
      message: 'Wild boar movement detected in Zone B.',
      timestamp: '15 minutes ago',
      location: 'Zone B - Clearing',
      animal: 'Wild Boar',
      confidence: '87%',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'detection',
      title: 'Elephant Detection',
      message: 'Elephant approaching human settlement.',
      timestamp: '1 hour ago',
      location: 'Zone C - Settlement Border',
      animal: 'Elephant',
      confidence: '92%',
      read: true,
      priority: 'high'
    },
    {
      id: '4',
      type: 'system',
      title: 'Camera Maintenance',
      message: 'Camera 3 in Zone A requires maintenance. Low battery detected.',
      timestamp: '3 hours ago',
      location: 'Zone A - Camera 3',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'detection',
      title: 'Deer Detected',
      message: 'Deer movement detected.',
      timestamp: '5 hours ago',
      location: 'Zone B - Water Source',
      animal: 'Deer',
      confidence: '78%',
      read: true,
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'detection'>('all');
  const [view, setView] = useState<'list' | 'settings'>('list');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'detection') return notification.type === 'detection';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const detectionCount = notifications.filter(n => n.type === 'detection').length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'detection': return ExclamationTriangleIcon;
      case 'detection': return CameraIcon;
      case 'system': return BellIcon;
      default: return BellIcon;
    }
  };

  const stats = [
    { label: 'Total Notifications', value: notifications.length, icon: BellIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'Unread', value: unreadCount, icon: ClockIcon, color: 'text-orange-600 bg-orange-100' },
    { label: 'Detections', value: detectionCount, icon: ExclamationTriangleIcon, color: 'text-red-600 bg-red-100' },
  ];

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Send email alerts for critical events</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="ml-2 text-sm text-gray-700">Device status updates</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Push Notifications</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Real-time detections</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="ml-2 text-sm text-gray-700">Maintenance reminders</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Schedule</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" defaultValue="22:00" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" defaultValue="07:00" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days to Receive Notifications</label>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <label key={day} className="flex items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                  <span className="ml-1 text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Monitor wildlife detections</p>
      </div>

      {/* View Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
            view === 'list'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setView('settings')}
          className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
            view === 'settings'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Settings
        </button>
      </div>

      {view === 'list' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'detection', label: 'Detections' },
                ].map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === filterOption.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Mark All as Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {filter === 'all' ? 'All Notifications' : 
                 filter === 'unread' ? 'Unread Notifications' : 
                 'Detections'}
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        notification.type === 'detection' ? 'bg-red-100' :
                        notification.type === 'detection' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <TypeIcon className={`h-6 w-6 ${
                          notification.type === 'detection' ? 'text-red-600' :
                          notification.type === 'detection' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 mt-1">{notification.message}</p>

                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{notification.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{notification.location}</span>
                          </div>
                          {notification.animal && (
                            <div className="flex items-center space-x-1">
                              <CameraIcon className="h-4 w-4" />
                              <span>{notification.animal} ({notification.confidence})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread' ? 'All notifications have been read' :
                   filter === 'detection' ? 'No detections at this time' :
                   'No notifications available'}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Settings View */
        renderSettings()
      )}
    </div>
  );
};

export default Notifications;
