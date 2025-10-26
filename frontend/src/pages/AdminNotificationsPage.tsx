import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  EnvelopeIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon
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
  userId?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Manager {
  _id: string;
  name: string;
  email: string;
}

const AdminNotificationsPage: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const fetchDetections = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Detection[] }>('/api/detections');
      setDetections(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      setDetections([]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await apiFetch<Manager[]>('/api/users?role=user');
      setManagers(response.data);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      setManagers([]);
    }
  };

  useEffect(() => {
    fetchDetections();
    fetchManagers();
  }, []);

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage || selectedManagers.length === 0) {
      setEmailError('Please fill in all fields and select at least one manager');
      return;
    }

    setSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      await apiFetch('/api/notifications/send-email', {
        method: 'POST',
        body: {
          managerIds: selectedManagers,
          subject: emailSubject,
          message: emailMessage
        }
      });

      setEmailSuccess('Email sent successfully to selected managers!');
      setEmailSubject('');
      setEmailMessage('');
      setSelectedManagers([]);
      
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess('');
      }, 2000);
    } catch (error: any) {
      setEmailError(error.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const toggleManagerSelection = (managerId: string) => {
    setSelectedManagers(prev => 
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  const selectAllManagers = () => {
    setSelectedManagers(managers.map(m => m._id));
  };

  const deselectAllManagers = () => {
    setSelectedManagers([]);
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

  const highConfidenceCount = detections.filter(d => d.probability >= 0.90).length;

  const stats = [
    { label: 'Total Detections', value: detections.length, icon: BellIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'High Confidence', value: highConfidenceCount, icon: ExclamationTriangleIcon, color: 'text-red-600 bg-red-100' },
    { label: 'Total Managers', value: managers.length, icon: UserGroupIcon, color: 'text-green-600 bg-green-100' },
    { label: 'Email Notifications', value: 'Ready', icon: EnvelopeIcon, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Notifications</h1>
        <p className="text-gray-600">Monitor detections and send notifications to managers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      {/* Send Email Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowEmailModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
          <EnvelopeIcon className="h-5 w-5" />
          Send Email to Managers
        </button>
      </div>

      {/* Detections List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Detections ({detections.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {detections.map((detection, index) => (
            <motion.div
              key={detection._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 transition-colors"
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
                  </div>

                  <p className="text-gray-600 mb-3">
                    A {detection.label} has been detected. Email notifications have been sent to relevant managers.
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
                          <span className="ml-1 text-gray-400">({detection.userId.name})</span>
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
                        <span className="ml-1 font-medium text-gray-900">{detection.source === 'browser-camera' ? 'Browser Camera' : detection.source || 'Camera'}</span>
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

        {detections.length === 0 && (
          <div className="p-12 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No detections found</h3>
            <p className="text-gray-500">No detections available</p>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Email Notification</h2>

            {emailError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {emailError}
              </div>
            )}

            {emailSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {emailSuccess}
              </div>
            )}

            {/* Manager Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Managers ({selectedManagers.length} selected)
                </label>
                <div className="space-x-2">
                  <button
                    onClick={selectAllManagers}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllManagers}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                {managers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No managers available</p>
                ) : (
                  managers.map(manager => (
                    <label key={manager._id} className="flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedManagers.includes(manager._id)}
                        onChange={() => toggleManagerSelection(manager._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                      />
                      <span className="text-sm text-gray-700">{manager.name} ({manager.email})</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Email Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter email subject"
              />
            </div>

            {/* Email Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your message..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailError('');
                  setEmailSuccess('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
