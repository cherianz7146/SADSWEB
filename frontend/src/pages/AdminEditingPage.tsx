import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { 
  PencilSquareIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'article' | 'announcement';
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  author: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const AdminEditingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'config'>('content');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'System Maintenance Notice',
      type: 'announcement',
      status: 'published',
      lastModified: '2024-01-15T10:30:00Z',
      author: 'Admin User'
    },
    {
      id: '2',
      title: 'User Guide - Getting Started',
      type: 'article',
      status: 'draft',
      lastModified: '2024-01-14T16:20:00Z',
      author: 'Content Manager'
    },
    {
      id: '3',
      title: 'Privacy Policy',
      type: 'page',
      status: 'published',
      lastModified: '2024-01-10T09:15:00Z',
      author: 'Legal Team'
    }
  ]);

  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@sads.com',
      role: 'Field Technician',
      status: 'active',
      lastLogin: '2024-01-15T08:30:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@sads.com',
      role: 'Data Analyst',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@sads.com',
      role: 'System Administrator',
      status: 'inactive',
      lastLogin: '2024-01-10T14:20:00Z'
    }
  ]);

  const [systemConfig, setSystemConfig] = useState({
    siteName: 'SADS Admin Panel',
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    maxFileSize: '10MB',
    sessionTimeout: 30
  });

  const filteredContent = contentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'article':
        return <PencilSquareIcon className="h-5 w-5 text-green-500" />;
      case 'announcement':
        return <Cog6ToothIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content & User Management</h1>
          <p className="text-gray-600">Manage content, users, and system configuration</p>
        </div>
        <BackButton />
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 inline mr-2" />
              Content Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-5 w-5 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
              System Configuration
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Content Management */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Content</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredContent.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Type: {item.type}</span>
                            <span>Author: {item.author}</span>
                            <span>Modified: {new Date(item.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-600 hover:text-gray-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-gray-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-900">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Management */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <PlusIcon className="h-5 w-5" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UsersIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.lastLogin).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* System Configuration */}
              <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={systemConfig.siteName}
                    onChange={(e) => setSystemConfig({ ...systemConfig, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size
                  </label>
                  <select
                    value={systemConfig.maxFileSize}
                    onChange={(e) => setSystemConfig({ ...systemConfig, maxFileSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="5MB">5MB</option>
                    <option value="10MB">10MB</option>
                    <option value="25MB">25MB</option>
                    <option value="50MB">50MB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) => setSystemConfig({ ...systemConfig, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">System Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.maintenanceMode}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Maintenance Mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.userRegistration}
                      onChange={(e) => setSystemConfig({ ...systemConfig, userRegistration: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Allow User Registration</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.emailNotifications}
                      onChange={(e) => setSystemConfig({ ...systemConfig, emailNotifications: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEditingPage;
