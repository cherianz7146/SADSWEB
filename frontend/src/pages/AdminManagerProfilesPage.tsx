import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/AdminLayout';

interface Manager {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: 'manager';
  isActive: boolean;
  plantation?: {
    name: string;
    location: string;
    fields: string[];
  };
  propertyId?: {
    _id: string;
    name: string;
    address: string;
  };
  permissions: {
    canViewCameras: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageStaff: boolean;
  };
  createdAt: string;
}

interface ManagerProfile {
  _id: string;
  Manager_Id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    userId: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
  };
  totalDetections: number;
  totalProperties: number;
  totalCameras: number;
  performanceScore: number;
  accountCreatedAt: string;
  lastActiveDate: string;
}

type TabType = 'accounts' | 'profiles';

const AdminManagerProfilesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  
  // Account Management State
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plantation: '',
    permissions: {
      canViewCameras: true,
      canViewReports: true,
      canManageSettings: false,
      canManageStaff: false
    }
  });

  // Profile Management State
  const [profiles, setProfiles] = useState<ManagerProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ManagerProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    totalDetections: 0,
    totalProperties: 0,
    totalCameras: 0,
    performanceScore: 0,
    averageResponseTime: 0,
    totalUptime: 0,
    averageConfidence: 0,
    mostDetectedAnimal: '',
    achievements: [] as string[]
  });

  useEffect(() => {
    if (activeTab === 'accounts') {
      fetchManagers();
    } else {
    fetchProfiles();
    }
  }, [activeTab]);

  // Account Management Functions
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/users');
      const managersOnly = response.data.filter((user: any) => user.role === 'manager');
      setManagers(managersOnly);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingManager) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions,
          role: 'manager'
        };

        if (formData.plantation && formData.plantation.trim()) {
          updateData.plantation = {
            name: formData.plantation.trim(),
            location: '',
            fields: []
          };
        }

        await apiFetch(`/api/users/${editingManager._id}`, {
          method: 'PUT',
          body: updateData
        });
      } else {
        const createData: any = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions,
          role: 'manager',
          password: 'TempPassword123!'
        };

        if (formData.plantation && formData.plantation.trim()) {
          createData.plantation = {
            name: formData.plantation.trim(),
            location: '',
            fields: []
          };
        }

        await apiFetch('/api/users', {
          method: 'POST',
          body: createData
        });
      }
      setShowModal(false);
      setEditingManager(null);
      setFormData({ 
        name: '', 
        email: '', 
        plantation: '',
        permissions: {
          canViewCameras: true,
          canViewReports: true,
          canManageSettings: false,
          canManageStaff: false
        }
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to save manager:', error);
      alert('Failed to save manager. Please check the console for details.');
    }
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      plantation: manager.plantation?.name || '',
      permissions: manager.permissions
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this manager?')) {
      try {
        await apiFetch(`/api/users/${id}`, {
          method: 'DELETE'
        });
        fetchManagers();
      } catch (error) {
        console.error('Failed to delete manager:', error);
      }
    }
  };

  const toggleManagerStatus = async (manager: Manager) => {
    try {
      await apiFetch(`/api/users/${manager._id}`, {
        method: 'PUT',
        body: {
          isActive: !manager.isActive
        }
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to toggle manager status:', error);
    }
  };

  const syncAllManagersToProfiles = async () => {
    if (!window.confirm('This will create manager profiles for all managers who don\'t have one. Continue?')) {
      return;
    }
    
    try {
      setSyncing(true);
      const response = await apiFetch('/api/manager-profiles/sync-all', {
        method: 'POST'
      });
      
      if (response.data?.success) {
        alert(`✅ ${response.data.message}\n\nSummary:\n- Created: ${response.data.summary.created}\n- Updated: ${response.data.summary.updated}\n- Skipped: ${response.data.summary.skipped}`);
        // Refresh both tabs
        fetchManagers();
        fetchProfiles();
      } else {
        alert('Sync completed with some issues. Check console for details.');
      }
    } catch (error: any) {
      console.error('Failed to sync managers:', error);
      alert(`Failed to sync managers: ${error.message || 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Profile Management Functions
  const fetchProfiles = async () => {
    try {
      setProfileLoading(true);
      setError(null);
      const response = await apiFetch<ManagerProfile[]>('/api/manager-profiles');
      setProfiles(response.data || []);
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load manager profiles');
      setProfiles([]);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleView = (profile: ManagerProfile) => {
    setSelectedProfile(profile);
    setIsViewModalOpen(true);
  };

  const handleProfileEdit = (profile: ManagerProfile) => {
    setSelectedProfile(profile);
    setProfileFormData({
      totalDetections: profile.totalDetections,
      totalProperties: profile.totalProperties,
      totalCameras: profile.totalCameras,
      performanceScore: profile.performanceScore,
      averageResponseTime: 0,
      totalUptime: 0,
      averageConfidence: 0,
      mostDetectedAnimal: '',
      achievements: []
    });
    setIsEditModalOpen(true);
  };

  const handleProfileDelete = (profile: ManagerProfile) => {
    setSelectedProfile(profile);
    setIsDeleteModalOpen(true);
  };

  const handleProfileCreate = () => {
    setProfileFormData({
      totalDetections: 0,
      totalProperties: 0,
      totalCameras: 0,
      performanceScore: 0,
      averageResponseTime: 0,
      totalUptime: 0,
      averageConfidence: 0,
      mostDetectedAnimal: '',
      achievements: []
    });
    setSelectedProfile(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProfile) return;
    
    try {
      await apiFetch(`/api/manager-profiles/${selectedProfile.Manager_Id._id}`, {
        method: 'PUT',
        body: JSON.stringify(profileFormData)
      });
      setIsEditModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleSaveCreate = async () => {
    setError('Please select a manager first. Use the Account Management tab to create a manager, then create their profile.');
    setIsCreateModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProfile) return;
    
    try {
      await apiFetch(`/api/manager-profiles/${selectedProfile.Manager_Id._id}`, {
        method: 'DELETE'
      });
      setIsDeleteModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile');
    }
  };

  const handleRefresh = async (profileId: string) => {
    try {
      await apiFetch(`/api/manager-profiles/${profileId}/refresh`, {
        method: 'POST'
      });
      fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh profile');
    }
  };

  const filteredProfiles = (profiles || []).filter(profile =>
    profile?.Manager_Id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile?.Manager_Id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile?.Manager_Id?.userId?.includes(searchTerm)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Manager Profiles</h1>
                <p className="text-sm text-gray-500">Manage manager accounts and performance analytics</p>
              </div>
              {activeTab === 'accounts' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={syncAllManagersToProfiles}
                    disabled={syncing}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Syncing...' : 'Sync to Profiles'}</span>
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Manager</span>
                  </button>
                </div>
              )}
              {activeTab === 'profiles' && (
              <button
                  onClick={handleProfileCreate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Profile</span>
              </button>
              )}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'accounts'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Management
              </button>
              <button
                onClick={() => setActiveTab('profiles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profiles'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Performance Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error: {error}</p>
              <button
                onClick={() => activeTab === 'profiles' ? fetchProfiles() : fetchManagers()}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Account Management Tab */}
          {activeTab === 'accounts' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading managers...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-600">Total Managers</p>
                      <p className="text-2xl font-bold text-gray-900">{managers.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-emerald-700">{managers.filter(m => m.isActive).length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-600">Blocked</p>
                      <p className="text-2xl font-bold text-red-700">{managers.filter(m => !m.isActive).length}</p>
                    </div>
                  </div>

                  {/* Managers Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {managers.map((manager) => (
                          <tr key={manager._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-gray-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {manager.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {manager.propertyId?.name || manager.plantation?.name ? (
                                <div>
                                  <p className="font-medium">{manager.propertyId?.name || manager.plantation?.name}</p>
                                  {(manager.propertyId?.address || manager.plantation?.location) && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {manager.propertyId?.address || manager.plantation?.location || 'Location not specified'}
                                    </p>
                                  )}
                                  {manager.userId && (
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                                      ID: {manager.userId}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Not assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {manager.permissions.canViewCameras && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Cameras
                                  </span>
                                )}
                                {manager.permissions.canViewReports && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Reports
                                  </span>
                                )}
                                {manager.permissions.canManageSettings && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Settings
                                  </span>
                                )}
                                {manager.permissions.canManageStaff && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    Staff
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleManagerStatus(manager)}
                                className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                  manager.isActive 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {manager.isActive ? (
                                  <>
                                    <CheckIcon className="h-3 w-3" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <XMarkIcon className="h-3 w-3" />
                                    <span>Blocked</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleEdit(manager)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Manager"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(manager._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Manager"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* Performance Analytics Tab */}
          {activeTab === 'profiles' && (
            <>
              {profileLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profiles...</p>
                  </div>
                </div>
              ) : (
                <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                      {profile.Manager_Id.avatar ? (
                        <img
                          src={profile.Manager_Id.avatar}
                          alt={profile.Manager_Id.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{profile.Manager_Id.name}</h3>
                      <p className="text-sm text-gray-500">{profile.Manager_Id.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.Manager_Id.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.Manager_Id.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.Manager_Id.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Performance</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.performanceScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Detections</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.totalDetections.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Properties</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.totalProperties}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleView(profile)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span className="text-sm">View</span>
                  </button>
                  <button
                            onClick={() => handleProfileEdit(profile)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleRefresh(profile.Manager_Id._id)}
                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Refresh Stats"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button
                            onClick={() => handleProfileDelete(profile)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No manager profiles found</p>
            </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Account Management Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingManager ? 'Edit Manager' : 'Add New Manager'}
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  {editingManager ? 'Update manager information and permissions' : 'Create a new manager account with custom permissions'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="manager@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plantation/Property
                    </label>
                    <input
                      type="text"
                      value={formData.plantation}
                      onChange={(e) => setFormData({ ...formData, plantation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter plantation or property name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Access Permissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Control what features this manager can access in the system
                  </p>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CameraIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">View Cameras</p>
                          <p className="text-xs text-gray-500">Access live camera feeds and detection</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canViewCameras}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canViewCameras: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">View Reports</p>
                          <p className="text-xs text-gray-500">Access detection reports and analytics</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canViewReports}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canViewReports: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Cog6ToothIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Manage Settings</p>
                          <p className="text-xs text-gray-500">Modify system settings and configuration</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canManageSettings}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canManageSettings: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Manage Staff</p>
                          <p className="text-xs text-gray-500">Add, edit, and remove staff members</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canManageStaff}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canManageStaff: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingManager(null);
                      setFormData({ 
                        name: '', 
                        email: '', 
                        plantation: '',
                        permissions: {
                          canViewCameras: true,
                          canViewReports: true,
                          canManageSettings: false,
                          canManageStaff: false
                        }
                      });
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingManager ? 'Update Manager' : 'Create Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile View Modal */}
        {isViewModalOpen && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Manager Profile Details</h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                      {selectedProfile.Manager_Id.avatar ? (
                        <img
                          src={selectedProfile.Manager_Id.avatar}
                          alt={selectedProfile.Manager_Id.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedProfile.Manager_Id.name}</h3>
                      <p className="text-gray-600">{selectedProfile.Manager_Id.email}</p>
                      <p className="text-sm text-gray-500">User ID: {selectedProfile.Manager_Id.userId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Detections</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProfile.totalDetections.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Performance Score</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProfile.performanceScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Properties Managed</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProfile.totalProperties}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Cameras Monitored</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProfile.totalCameras}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {isEditModalOpen && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Manager Profile</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Detections</label>
                      <input
                        type="number"
                        value={profileFormData.totalDetections}
                        onChange={(e) => setProfileFormData({ ...profileFormData, totalDetections: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Properties</label>
                      <input
                        type="number"
                        value={profileFormData.totalProperties}
                        onChange={(e) => setProfileFormData({ ...profileFormData, totalProperties: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cameras</label>
                      <input
                        type="number"
                        value={profileFormData.totalCameras}
                        onChange={(e) => setProfileFormData({ ...profileFormData, totalCameras: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Performance Score</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={profileFormData.performanceScore}
                        onChange={(e) => setProfileFormData({ ...profileFormData, performanceScore: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Delete Modal */}
        {isDeleteModalOpen && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Manager Profile</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the profile for <strong>{selectedProfile.Manager_Id.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminManagerProfilesPage;
