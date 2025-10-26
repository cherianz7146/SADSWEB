import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';
import { apiFetch } from '../utils/api';

interface Detection {
  _id: string;
  label: string;
  probability: number;
  location?: string;
  propertyName?: string;
  source?: string;
  detectedAt: string;
  createdAt: string;
  read?: boolean;
  userId?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
  readAt?: string;
  senderId?: {
    name: string;
    email: string;
    role: string;
  };
}

const ManagerNotificationsPage: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchDetections = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Detection[] }>('/api/detections');
      const detectionList = response.data.data || [];
      setDetections(detectionList.map((d: Detection) => ({ ...d, read: false })));
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      setDetections([]);
    }
  };

  const fetchAdminNotifications = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: AdminNotification[] }>('/api/notifications');
      setAdminNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
      setAdminNotifications([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDetections(), fetchAdminNotifications()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredDetections = detections.filter(detection => {
    if (filter === 'unread') return !detection.read;
    return true;
  });

  const filteredAdminNotifications = adminNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    return true;
  });

  const markDetectionAsRead = (id: string) => {
    setDetections(prev => 
      prev.map(detection => 
        detection._id === id 
          ? { ...detection, read: true }
          : detection
      )
    );
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setAdminNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' });
      setDetections(prev => prev.map(detection => ({ ...detection, read: true })));
      setAdminNotifications(prev => prev.map(notification => ({ ...notification, read: true, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const totalNotifications = detections.length + adminNotifications.length;
  const unreadDetections = detections.filter(d => !d.read).length;
  const unreadAdminNotifications = adminNotifications.filter(n => !n.read).length;
  const totalUnread = unreadDetections + unreadAdminNotifications;

  const stats = [
    { label: 'Total Notifications', value: totalNotifications, icon: BellIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'Unread', value: totalUnread, icon: ExclamationTriangleIcon, color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Detection Notifications</h1>
        <p className="text-gray-600">Real-time wildlife detection alerts from your property</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mark All as Read
            </button>

            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Notifications Section */}
      {filteredAdminNotifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Admin Notifications
                {filteredAdminNotifications.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredAdminNotifications.length} notification{filteredAdminNotifications.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Messages from system administrators</p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAdminNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                }`}
                onClick={() => markNotificationAsRead(notification._id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.emailSent ? (
                      <EnvelopeIcon className="h-6 w-6" />
                    ) : (
                      <BellIcon className="h-6 w-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {notification.senderId && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>From: {notification.senderId.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{getTimeAgo(notification.createdAt)}</span>
                      </div>
                      {notification.emailSent && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>Email sent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Wildlife Detections Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Wildlife Detections
            {filteredDetections.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredDetections.length} detection{filteredDetections.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredDetections.map((detection, index) => (
            <motion.div
              key={detection._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                !detection.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => markDetectionAsRead(detection._id)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {detection.label.charAt(0).toUpperCase() + detection.label.slice(1)} Detected
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!detection.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">
                    A {detection.label} has been detected on your property. Please take immediate action.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {detection.userId && (
                      <div className="flex items-start space-x-2">
                        <div className="h-5 w-5 flex items-center justify-center text-xs font-bold text-emerald-600 bg-emerald-100 rounded flex-shrink-0 mt-0.5">
                          ID
                        </div>
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <span className="ml-1 font-bold text-emerald-600">{detection.userId.userId}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Property:</span>
                        <span className="ml-1 font-medium text-gray-900">{detection.propertyName || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {detection.location && (
                      <div className="flex items-start space-x-2">
                        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-1 font-medium text-gray-900">{detection.location}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-1 font-medium text-gray-900">{new Date(detection.detectedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <CameraIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <span className="ml-1 font-medium text-gray-900">{detection.source === 'video' ? 'Live Camera' : 'Uploaded Image'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    {getTimeAgo(detection.detectedAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDetections.length === 0 && (
          <div className="p-12 text-center">
            <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wildlife detections found</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'All detections have been read' :
               loading ? 'Loading detections...' :
               'No detections available'}
            </p>
          </div>
        )}
      </div>

      {/* Empty state when no notifications at all */}
      {filteredDetections.length === 0 && filteredAdminNotifications.length === 0 && !loading && (
        <div className="mt-8 text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">
            {filter === 'unread' 
              ? 'You have no unread notifications' 
              : 'No notifications to display'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerNotificationsPage;
