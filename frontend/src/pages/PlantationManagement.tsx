import React, { useState, useEffect } from 'react';
import { PlusIcon, UserIcon, MapPinIcon, CheckIcon, XMarkIcon, PencilIcon, TrashIcon, EyeIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';
import BackButton from '../components/BackButton';
import Detector from '../components/Detector';

interface Plantation {
  _id: string;
  name: string;
  address: string;
  status: string;
  cameraCount: number;
  plantation: {
    name: string;
    location: string;
    fields: string[];
  };
  manager: {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  createdAt: string;
}

interface UnassignedManager {
  _id: string;
  name: string;
  email: string;
  plantation: any;
  createdAt: string;
}

const PlantationManagement: React.FC = () => {
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [unassignedManagers, setUnassignedManagers] = useState<UnassignedManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Plantation | null>(null);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [plantationInfo, setPlantationInfo] = useState({
    name: '',
    location: '',
    fields: ['']
  });
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Plantation | null>(null);
  const [propertyFormData, setPropertyFormData] = useState({
    name: '',
    address: '',
    cameraCount: 0
  });
  const [cameraModal, setCameraModal] = useState<{ open: boolean; property: Plantation | null }>({ open: false, property: null });
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plantationsRes, unassignedRes] = await Promise.all([
        apiFetch('/api/plantations'),
        apiFetch('/api/plantations/unassigned')
      ]);
      setPlantations(plantationsRes.data);
      setUnassignedManagers(unassignedRes.data);
    } catch (error) {
      console.error('Failed to fetch plantation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedProperty || !selectedManager) return;

    try {
      await apiFetch('/api/plantations/assign', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          managerId: selectedManager,
          plantationInfo
        })
      });
      
      setShowAssignModal(false);
      setSelectedProperty(null);
      setSelectedManager('');
      setPlantationInfo({ name: '', location: '', fields: [''] });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign manager:', error);
    }
  };

  const addField = () => {
    setPlantationInfo({
      ...plantationInfo,
      fields: [...plantationInfo.fields, '']
    });
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...plantationInfo.fields];
    newFields[index] = value;
    setPlantationInfo({
      ...plantationInfo,
      fields: newFields
    });
  };

  const removeField = (index: number) => {
    const newFields = plantationInfo.fields.filter((_, i) => i !== index);
    setPlantationInfo({
      ...plantationInfo,
      fields: newFields
    });
  };

  // Property Management Functions
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        // Update property
        await apiFetch(`/api/properties/${editingProperty._id}`, {
          method: 'PUT',
          body: JSON.stringify(propertyFormData)
        });
      } else {
        // Create new property
        await apiFetch('/api/properties', {
          method: 'POST',
          body: JSON.stringify(propertyFormData)
        });
      }
      setShowPropertyModal(false);
      setEditingProperty(null);
      setPropertyFormData({ name: '', address: '', cameraCount: 0 });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  const handleEditProperty = (property: Plantation) => {
    setEditingProperty(property);
    setPropertyFormData({
      name: property.name,
      address: property.address,
      cameraCount: property.cameraCount
    });
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this plantation/property?')) {
      try {
        await apiFetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });
        fetchData(); // Refresh the list
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
          <h1 className="text-2xl font-semibold text-gray-900">Plantations & Properties</h1>
          <p className="text-sm text-gray-500">Manage plantations, properties, and assign managers</p>
        </div>
        <button
          onClick={() => setShowPropertyModal(true)}
          className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Plantations</p>
          <p className="text-2xl font-bold text-gray-900">{plantations.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{plantations.filter(p => p.status==='active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Cameras</p>
          <p className="text-2xl font-bold text-indigo-700">{plantations.reduce((sum, p) => sum + p.cameraCount, 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Unassigned Managers</p>
          <p className="text-2xl font-bold text-orange-700">{unassignedManagers.length}</p>
        </div>
      </div>

      {/* Plantations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Plantations & Assignments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {plantations.map((plantation) => (
            <div key={plantation._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">{plantation.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plantation.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : plantation.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plantation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plantation.address}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{plantation.cameraCount} cameras</span>
                    {plantation.plantation?.name && (
                      <span>Plantation: {plantation.plantation.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setCameraModal({ open: true, property: plantation });
                        setCameraEnabled(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-50"
                      title="View live camera"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditProperty(plantation)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50"
                      title="Edit property"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(plantation._id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                      title="Delete property"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {plantation.manager ? (
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{plantation.manager.name}</span>
                        {plantation.manager.isActive ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{plantation.manager.email}</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">No manager assigned</p>
                      <button
                        onClick={() => {
                          setSelectedProperty(plantation);
                          setShowAssignModal(true);
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Assign Manager
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned Managers */}
      {unassignedManagers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Unassigned Managers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {unassignedManagers.map((manager) => (
              <div key={manager._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{manager.name}</p>
                    <p className="text-sm text-gray-500">{manager.email}</p>
                  </div>
                </div>
                <span className="text-sm text-orange-600 font-medium">Unassigned</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Add/Edit Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingProperty ? 'Edit Property' : 'Add Property'}
            </h2>
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={propertyFormData.name}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={propertyFormData.address}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Camera Count</label>
                <input
                  type="number"
                  value={propertyFormData.cameraCount}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, cameraCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                    setPropertyFormData({ name: '', address: '', cameraCount: 0 });
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

      {/* Assign Manager Modal */}
      {showAssignModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Assign Manager to {selectedProperty.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Manager</label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose a manager</option>
                  {unassignedManagers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Name</label>
                <input
                  type="text"
                  value={plantationInfo.name}
                  onChange={(e) => setPlantationInfo({ ...plantationInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter plantation name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={plantationInfo.location}
                  onChange={(e) => setPlantationInfo({ ...plantationInfo, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter plantation location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                {plantationInfo.fields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => updateField(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={`Field ${index + 1}`}
                    />
                    {plantationInfo.fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addField}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Add Field
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedProperty(null);
                  setSelectedManager('');
                  setPlantationInfo({ name: '', location: '', fields: [''] });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignManager}
                disabled={!selectedManager}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantationManagement;
