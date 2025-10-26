import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import Detector from '../components/Detector';
import BackButton from '../components/BackButton';

interface Property {
  _id: string;
  name: string;
  address: string;
  cameraCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cameraCount: 0
  });
  const [cameraModal, setCameraModal] = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await apiFetch('/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        // Update property
        await apiFetch(`/api/properties/${editingProperty._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        // Create new property
        await apiFetch('/api/properties', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            managerId: '64f8b1234567890abcdef123' // This should come from user context
          })
        });
      }
      setShowModal(false);
      setEditingProperty(null);
      setFormData({ name: '', address: '', cameraCount: 0 });
      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      cameraCount: property.cameraCount
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await apiFetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });
        fetchProperties(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500">Manage estates, addresses, and connected cameras</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Properties</p>
          <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{properties.filter(p => p.status==='active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Cameras</p>
          <p className="text-2xl font-bold text-indigo-700">{properties.reduce((sum, p) => sum + p.cameraCount, 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cameras</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.cameraCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    property.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setCameraModal({ open: true, property });
                      setCameraEnabled(true);
                    }}
                    className="text-emerald-600 hover:text-emerald-900"
                    title="View live camera"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(property)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(property._id)}
                    className="text-red-600 hover:text-red-900"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingProperty ? 'Edit Property' : 'Add Property'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Camera Count</label>
                <input
                  type="number"
                  value={formData.cameraCount}
                  onChange={(e) => setFormData({ ...formData, cameraCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProperty(null);
                    setFormData({ name: '', address: '', cameraCount: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  {editingProperty ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {cameraModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Live Camera Feed</h2>
                <p className="text-sm text-gray-500">{cameraModal.property?.name} — {cameraModal.property?.address}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCameraEnabled(v => !v)}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${cameraEnabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {cameraEnabled ? (
                    <>
                      <PauseIcon className="h-4 w-4" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </button>
                <button onClick={() => setCameraModal({ open: false, property: null })} className="px-3 py-2 text-gray-600 hover:text-gray-900">Close</button>
              </div>
            </div>

            <Detector enabled={cameraEnabled} onDetection={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;

