import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import BackButton from '../components/BackButton';

interface Manager {
  _id: string;
  name: string;
  email: string;
  role: 'manager';
  isActive: boolean;
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
        await apiFetch(`/api/users/${editingManager._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            role: 'manager'
          })
        });
      } else {
        // Create new manager
        await apiFetch('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            role: 'manager',
            password: 'TempPassword123!' // This should be generated or set by admin
          })
        });
      }
      setShowModal(false);
      setEditingManager(null);
      setFormData({ 
        name: '', 
        email: '', 
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
    }
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
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
        body: JSON.stringify({
          isActive: !manager.isActive
        })
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.email}</td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingManager ? 'Edit Manager' : 'Add Manager'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canViewCameras}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canViewCameras: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">View Cameras</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canViewReports}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canViewReports: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">View Reports</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canManageSettings}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canManageSettings: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Manage Settings</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canManageStaff}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canManageStaff: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Manage Staff</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingManager(null);
                    setFormData({ 
                      name: '', 
                      email: '', 
                      permissions: {
                        canViewCameras: true,
                        canViewReports: true,
                        canManageSettings: false,
                        canManageStaff: false
                      }
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  {editingManager ? 'Update' : 'Create'}
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










