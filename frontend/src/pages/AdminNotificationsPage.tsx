import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { 
  BellIcon, 
  PaperAirplaneIcon, 
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const AdminNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance Alert',
      message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM',
      type: 'warning',
      recipient: 'All Users',
      status: 'sent',
      timestamp: '2024-01-15T10:30:00Z',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Device Offline Alert',
      message: 'Camera 3 in Field C has gone offline. Please check connection.',
      type: 'error',
      recipient: 'Field Technicians',
      status: 'sent',
      timestamp: '2024-01-15T09:15:00Z',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Weekly Report Available',
      message: 'Your weekly deterrent activity report is now available.',
      type: 'info',
      recipient: 'All Users',
      status: 'pending',
      timestamp: '2024-01-15T08:45:00Z',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Successful Detection',
      message: 'Wild boar detected and successfully deterred in Field A.',
      type: 'success',
      recipient: 'Field Managers',
      status: 'sent',
      timestamp: '2024-01-14T16:20:00Z',
      priority: 'low'
    }
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipient: '',
    priority: 'medium' as const
  });

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendNotification = () => {
    // Handle sending notification logic here
    console.log('Sending notification:', newNotification);
    // Reset form
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      recipient: '',
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Send notifications and manage notification history</p>
        </div>
        <BackButton />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Send Notification
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notification History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'send' ? (
            /* Send Notification Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>
                  <select
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification({ ...newNotification, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select recipient</option>
                    <option value="All Users">All Users</option>
                    <option value="Field Technicians">Field Technicians</option>
                    <option value="Field Managers">Field Managers</option>
                    <option value="System Administrators">System Administrators</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter notification message"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSendNotification}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </div>
          ) : (
            /* Notification History */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>To: {notification.recipient}</span>
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
