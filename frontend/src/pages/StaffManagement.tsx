import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

interface Manager {
  id: string;
  name: string;
  email: string;
  plantation: {
    name: string;
    location: string;
    fields: string[];
  };
  permissions: {
    canViewCameras: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageStaff: boolean;
  };
  status: 'active' | 'inactive';
  lastLogin: string;
}

const StaffManagement: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([
    { 
      id: '1', 
      name: 'Raj Kumar', 
      email: 'raj@plantation.com', 
      plantation: { name: 'Plantation A', location: 'North Zone', fields: ['Field 1', 'Field 2', 'Field 3'] },
      permissions: { canViewCameras: true, canViewReports: true, canManageSettings: false, canManageStaff: false },
      status: 'active', 
      lastLogin: '2 hours ago' 
    },
    { 
      id: '2', 
      name: 'Priya Sharma', 
      email: 'priya@plantation.com', 
      plantation: { name: 'Plantation B', location: 'South Zone', fields: ['Field 1', 'Field 2'] },
      permissions: { canViewCameras: true, canViewReports: true, canManageSettings: true, canManageStaff: false },
      status: 'active', 
      lastLogin: '1 day ago' 
    },
    { 
      id: '3', 
      name: 'Amit Singh', 
      email: 'amit@plantation.com', 
      plantation: { name: 'Plantation C', location: 'East Zone', fields: ['Field 1', 'Field 2', 'Field 3', 'Field 4'] },
      permissions: { canViewCameras: true, canViewReports: false, canManageSettings: false, canManageStaff: false },
      status: 'inactive', 
      lastLogin: '1 week ago' 
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plantationName: '',
    plantationLocation: '',
    fields: '',
    permissions: {
      canViewCameras: true,
      canViewReports: true,
      canManageSettings: false,
      canManageStaff: false
    }
  });

  const stats = [
    { label: 'Total Managers', value: managers.length, icon: UsersIcon, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Managers', value: managers.filter(m => m.status === 'active').length, icon: ShieldCheckIcon, color: 'text-green-600 bg-green-100' },
    { label: 'Plantations', value: managers.length, icon: MapPinIcon, color: 'text-purple-600 bg-purple-100' },
  ];

  const handleAddManager = () => {
    setEditingManager(null);
    setFormData({
      name: '',
      email: '',
      plantationName: '',
      plantationLocation: '',
      fields: '',
      permissions: {
        canViewCameras: true,
        canViewReports: true,
        canManageSettings: false,
        canManageStaff: false
      }
    });
    setShowModal(true);
  };

  const handleEditManager = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      plantationName: manager.plantation.name,
      plantationLocation: manager.plantation.location,
      fields: manager.plantation.fields.join(', '),
      permissions: { ...manager.permissions }
    });
    setShowModal(true);
  };

  const handleSaveManager = () => {
    const fields = formData.fields.split(',').map(f => f.trim()).filter(f => f);
    
    if (editingManager) {
      setManagers(prev => prev.map(manager => 
        manager.id === editingManager.id 
          ? {
              ...manager,
              name: formData.name,
              email: formData.email,
              plantation: {
                name: formData.plantationName,
                location: formData.plantationLocation,
                fields
              },
              permissions: formData.permissions
            }
          : manager
      ));
    } else {
      const newManager: Manager = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        plantation: {
          name: formData.plantationName,
          location: formData.plantationLocation,
          fields
        },
        permissions: formData.permissions,
        status: 'active',
        lastLogin: 'Never'
      };
      setManagers(prev => [...prev, newManager]);
    }
    setShowModal(false);
  };

  const handleDeleteManager = (id: string) => {
    if (window.confirm('Are you sure you want to delete this manager?')) {
      setManagers(prev => prev.filter(manager => manager.id !== id));
    }
  };

  const toggleManagerStatus = (id: string) => {
    setManagers(prev => prev.map(manager => 
      manager.id === id 
        ? { ...manager, status: manager.status === 'active' ? 'inactive' : 'active' }
        : manager
    ));
  };

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Management</h1>
        <p className="text-gray-600">Manage plantation managers and their permissions</p>
      </div>

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

      {/* Add Manager Button */}
      <div className="mb-6">
        <button
          onClick={handleAddManager}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Manager</span>
        </button>
      </div>

      {/* Managers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managers.map((manager, index) => (
                <motion.tr
                  key={manager.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                      <div className="text-sm text-gray-500">{manager.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manager.plantation.name}</div>
                      <div className="text-sm text-gray-500">{manager.plantation.location}</div>
                      <div className="text-xs text-gray-400">{manager.plantation.fields.length} fields</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {manager.permissions.canViewCameras && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Cameras</span>
                      )}
                      {manager.permissions.canViewReports && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Reports</span>
                      )}
                      {manager.permissions.canManageSettings && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Settings</span>
                      )}
                      {manager.permissions.canManageStaff && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Staff</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleManagerStatus(manager.id)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        manager.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {manager.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {manager.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditManager(manager)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteManager(manager.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingManager ? 'Edit Manager' : 'Add Manager'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Name</label>
                <input
                  type="text"
                  value={formData.plantationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, plantationName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Location</label>
                <input
                  type="text"
                  value={formData.plantationLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, plantationLocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fields (comma separated)</label>
                <input
                  type="text"
                  value={formData.fields}
                  onChange={(e) => setFormData(prev => ({ ...prev, fields: e.target.value }))}
                  placeholder="Field 1, Field 2, Field 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2">
                  {Object.entries(formData.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, [key]: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManager}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingManager ? 'Update' : 'Add'} Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;