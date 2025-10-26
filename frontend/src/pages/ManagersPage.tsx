import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  CheckIcon, 
  XMarkIcon,
  CameraIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import BackButton from '../components/BackButton';

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

const ManagersPage: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await apiFetch('/api/users');
      // Filter only managers (exclude admins)
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
        // Update manager
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions,
          role: 'manager'
        };

        // Only include plantation if it has a value
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
        // Create new manager
        const createData: any = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions,
          role: 'manager',
          password: 'TempPassword123!' // This should be generated or set by admin
        };

        // Only include plantation if it has a value
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
      fetchManagers(); // Refresh the list
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
        fetchManagers(); // Refresh the list
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
      fetchManagers(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle manager status:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <BackButton />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Managers</h1>
          <p className="text-sm text-gray-500">Manage manager accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Manager</span>
        </button>
      </div>

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {editingManager ? 'Edit Manager' : 'Add New Manager'}
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                {editingManager ? 'Update manager information and permissions' : 'Create a new manager account with custom permissions'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Basic Information Section */}
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

              {/* Permissions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Access Permissions
                </h3>
                <p className="text-sm text-gray-600">
                  Control what features this manager can access in the system
                </p>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {/* Camera Permission */}
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

                  {/* Reports Permission */}
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

                  {/* Settings Permission */}
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

                  {/* Staff Permission */}
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

              {/* Action Buttons */}
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
    </div>
  );
};

export default ManagersPage;










