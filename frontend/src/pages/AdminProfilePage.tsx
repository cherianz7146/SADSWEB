import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  PencilIcon,
  ClockIcon,
  GlobeAltIcon,
  KeyIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  PhotoIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/AdminLayout';

interface AdminAdditionalInfo {
  accountAge: number;
  accountAgeFormatted: string;
  timezone: string;
  authMethod: string;
  lastProfileUpdate: string;
  hasGoogleAuth: boolean;
  hasPassword: boolean;
}

interface AdminActivity {
  id: string;
  type: string;
  action: string;
  description: string;
  metadata?: any;
  timestamp: string;
  source: string;
}

const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<AdminAdditionalInfo | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      try {
        const response = await apiFetch<AdminAdditionalInfo>('/api/users/me/additional-info');
        setAdditionalInfo(response.data);
      } catch (err: any) {
        console.error('Failed to fetch additional info:', err);
      }
    };

    if (user && user.role === 'admin') {
      fetchAdditionalInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await apiFetch<AdminActivity[]>('/api/users/me/activity');
        setActivities(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch activities:', err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchActivities();
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If it starts with +91, remove it to get just the digits
    if (value.startsWith('+91')) {
      value = value.substring(3);
    }
    
    // Remove all non-digit characters
    value = value.replace(/\D/g, '');
    
    // If starts with 91, remove it (country code already handled)
    if (value.startsWith('91')) {
      value = value.substring(2);
    }
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Format as +91XXXXXXXXXX (no space, 13 characters total)
    const formatted = value ? `+91${value}` : '';
    setFormData({ ...formData, phone: formatted });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Validate phone number (should be +91 followed by 10 digits, no space - 13 characters total)
      const phoneRegex = /^\+91\d{10}$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        setError('Phone number must be in format +91XXXXXXXXXX (13 characters: +91 + 10 digits)');
        setLoading(false);
        return;
      }

      // If avatar file is selected, convert to base64
      let avatarData = null;
      if (avatarFile) {
        avatarData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      } else if (avatarPreview === null && user?.avatar) {
        // If avatar was deleted (set to null explicitly)
        avatarData = null;
      }

      const updateData: any = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone || null
      };

      if (avatarData !== undefined) {
        updateData.avatar = avatarData;
      }

      const response = await apiFetch<any>('/api/users/me/profile', {
        method: 'PUT',
        body: updateData
      });
      
      setUser(response.data);
      setAvatarFile(null);
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'user_created':
        return <UserPlusIcon className="h-5 w-5 text-emerald-500" />;
      case 'user_updated':
        return <PencilIcon className="h-5 w-5 text-purple-500" />;
      case 'user_deleted':
        return <UserMinusIcon className="h-5 w-5 text-red-500" />;
      case 'property_created':
      case 'property_updated':
        return <HomeIcon className="h-5 w-5 text-purple-500" />;
      case 'manager_profile_created':
      case 'manager_profile_updated':
        return <ChartBarIcon className="h-5 w-5 text-amber-500" />;
      case 'profile_updated':
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      case 'login':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const groupActivitiesByDate = (activities: AdminActivity[]) => {
    const groups: { [key: string]: AdminActivity[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= today) {
        groups.today.push(activity);
      } else if (activityDate >= yesterday) {
        groups.yesterday.push(activity);
      } else if (activityDate >= weekAgo) {
        groups.thisWeek.push(activity);
      } else {
        groups.older.push(activity);
      }
    });

    return groups;
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">User not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
                <p className="text-sm text-gray-500">Manage your administrator account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {/* Success/Error Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-green-800">{message}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Profile Header Card - Green Gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg overflow-hidden mb-6"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Avatar - Large Rounded Square with Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-emerald-400/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-xl overflow-hidden">
                    {avatarPreview || user.avatar ? (
                      <img
                        src={avatarPreview || user.avatar || ''}
                        alt={user.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-white" />
                    )}
                  </div>
                  {/* Badge Overlay */}
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-2 border-4 border-white shadow-lg">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* User Information */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                    <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                      Administrator
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white">
                      <EnvelopeIcon className="h-5 w-5" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-white">
                        <PhoneIcon className="h-5 w-5" />
                        <span className="font-medium">{user.phone}</span>
                      </div>
                    )}
                    {user.userId && (
                      <div className="text-white/90 text-sm mt-1">
                        <span className="font-medium">User ID:</span> {user.userId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-emerald-200"
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold border border-white/30"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-white mb-3">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                          {avatarPreview || user.avatar ? (
                            <img
                              src={avatarPreview || user.avatar || ''}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-12 w-12 text-white" />
                          )}
                        </div>
                        {(avatarPreview || user.avatar) && (
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all text-white font-medium flex items-center gap-2 cursor-pointer">
                            <CloudArrowUpIcon className="h-5 w-5" />
                            <span>{avatarPreview || user.avatar ? 'Change Picture' : 'Upload Picture'}</span>
                          </div>
                        </label>
                        <p className="text-xs text-white/70 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                        placeholder="+91XXXXXXXXXX"
                        maxLength={13}
                      />
                      <p className="text-xs text-white/70 mt-1">Format: +91 followed by 10 digits (13 characters total)</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarFile(null);
                        setAvatarPreview(user?.avatar || null);
                        setError(null);
                      }}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold border border-white/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingAvatar}
                      className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>

          {/* Stats Grid - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Account Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Login</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
              <p className="text-2xl font-bold text-gray-900">Administrator</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <div className="mt-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  user.isActive !== false
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Account Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <KeyIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
              </div>
              
              {additionalInfo && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Account Age</p>
                      <p className="text-base font-semibold text-gray-900">
                        {additionalInfo.accountAgeFormatted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Timezone</p>
                      <p className="text-base font-semibold text-gray-900">
                        {additionalInfo.timezone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <KeyIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Authentication Method</p>
                      <p className="text-base font-semibold text-gray-900">
                        {additionalInfo.authMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Last Profile Update</p>
                      <p className="text-base font-semibold text-gray-900">
                        {additionalInfo.lastProfileUpdate ? formatDate(additionalInfo.lastProfileUpdate) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Activity & History Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Activity & History</h3>
              </div>
              
              {loadingActivities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No activities recorded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your activity history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(() => {
                    const grouped = groupActivitiesByDate(activities);
                    const sections = [
                      { title: 'TODAY', activities: grouped.today },
                      { title: 'YESTERDAY', activities: grouped.yesterday },
                      { title: 'THIS WEEK', activities: grouped.thisWeek },
                      { title: 'OLDER', activities: grouped.older }
                    ].filter(section => section.activities.length > 0);

                    return sections.map((section, sectionIdx) => (
                      <div key={sectionIdx}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                          {section.title}
                        </h4>
                        <div className="space-y-2">
                          {section.activities.map((activity) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {getActivityIcon(activity.action)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatActivityDate(activity.timestamp)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
