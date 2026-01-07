import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ChartBarIcon,
  CameraIcon,
  UserIcon,
  BellIcon,
  PlusIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/AdminLayout';

interface FieldStats {
  totalFields: number;
  activeFields: number;
  withDetections: number;
  assignedManagers: number;
}

interface Field {
  _id: string;
  name: string;
  address: string;
  status: string;
  managerId: {
    _id: string;
    name: string;
    email: string;
  };
  plantation: {
    name: string;
    location?: string;
    fields?: string[];
  };
  cameraCount: number;
  profileImage?: string;
  createdAt: string;
}

const FieldManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<FieldStats>({
    totalFields: 0,
    activeFields: 0,
    withDetections: 0,
    assignedManagers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPlantation, setSelectedPlantation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all properties (fields)
        const propertiesResponse = await apiFetch<Field[]>('/api/properties');
        if (propertiesResponse.data) {
          setFields(propertiesResponse.data);
        }
        
        // Fetch stats
        const statsResponse = await apiFetch<FieldStats>('/api/properties/stats');
        if (statsResponse.data) {
          const statsData = statsResponse.data;
          // Get unique managers count
          const uniqueManagers = new Set(
            propertiesResponse.data?.map(field => field.managerId?._id) || []
          );
          
          // Count fields with detections (we'll need to fetch detections for this)
          try {
            const detectionsResponse = await apiFetch('/api/detections');
            const detections = detectionsResponse.data?.data || detectionsResponse.data || [];
            const detectionPropertyIds = new Set(
              detections.map((d: any) => d.propertyId?._id || d.propertyId).filter(Boolean)
            );
            const withDetections = propertiesResponse.data?.filter(
              (f: Field) => detectionPropertyIds.has(f._id)
            ).length || 0;
            
            setStats({
              totalFields: statsData.total || 0,
              activeFields: statsData.active || 0,
              withDetections: withDetections,
              assignedManagers: uniqueManagers.size
            });
          } catch (detectionError) {
            // If detections fetch fails, just set withDetections to 0
            setStats({
              totalFields: statsData.total || 0,
              activeFields: statsData.active || 0,
              withDetections: 0,
              assignedManagers: uniqueManagers.size
            });
          }
          
        }
      } catch (err: any) {
        console.error('Error fetching fields:', err);
        setError(err.message || 'Failed to load fields');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFields();
    }
  }, [user]);

  const filteredFields = fields.filter(field => {
    // Filter by plantation
    if (selectedPlantation !== 'all') {
      if (field.plantation?.name !== selectedPlantation) {
        return false;
      }
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      if (field.status !== selectedStatus) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !field.name.toLowerCase().includes(query) &&
        !field.plantation?.name?.toLowerCase().includes(query) &&
        !field.address.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    return true;
  });

  const uniquePlantations = Array.from(
    new Set(fields.map(f => f.plantation?.name).filter(Boolean))
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fields...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Go back to Dashboard
            </button>
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Field Management</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
                </button>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-700 font-medium">{user?.name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Field Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Field Management</h2>
                <p className="text-gray-600">Manage and monitor all agricultural fields</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Field</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalFields}</div>
                <div className="text-sm text-gray-600">Total Fields</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeFields}</div>
                <div className="text-sm text-gray-600">Active Fields</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <CameraIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.withDetections}</div>
                <div className="text-sm text-gray-600">With Detections</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <UserIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.assignedManagers}</div>
                <div className="text-sm text-gray-600">Assigned Managers</div>
              </motion.div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={selectedPlantation}
                  onChange={(e) => setSelectedPlantation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Plantations</option>
                  {uniquePlantations.map((plantation) => (
                    <option key={plantation} value={plantation}>
                      {plantation}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Field Cards Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFields.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No fields found</p>
                  </div>
                ) : (
                  filteredFields.map((field, index) => (
                    <motion.div
                      key={field._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/admin/field-management/${field._id}`)}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 overflow-hidden">
                        {field.profileImage ? (
                          <img
                            src={field.profileImage}
                            alt={field.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            field.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : field.status === 'inactive'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{field.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {field.plantation?.name || 'No plantation assigned'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{field.cameraCount} cameras</span>
                          <span>{field.managerId?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cameras</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFields.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                          No fields found
                        </td>
                      </tr>
                    ) : (
                      filteredFields.map((field) => (
                        <tr
                          key={field._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/admin/field-management/${field._id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {field.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.plantation?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.managerId?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              field.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : field.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.cameraCount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default FieldManagementPage;

