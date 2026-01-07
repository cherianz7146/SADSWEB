import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MapPinIcon,
  UserIcon,
  CameraIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PhotoIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/AdminLayout';

interface Property {
  _id: string;
  name: string;
  address: string;
  description?: string;
  status: string;
  cameraCount: number;
  managerId: {
    _id: string;
    name: string;
    email: string;
  };
  plantation?: {
    name: string;
    location?: string;
    fields?: string[];
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  images?: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

const PlantationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    status: 'active'
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<Property>(`/api/properties/${id}`);
        if (response.data) {
          setProperty(response.data);
          setFormData({
            name: response.data.name || '',
            address: response.data.address || '',
            description: response.data.description || '',
            status: response.data.status || 'active'
          });
          setProfileImagePreview(response.data.profileImage || null);
        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    try {
      setUploading(true);
      setError(null);

      // Convert to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to backend
      const response = await apiFetch<{ images: string[] }>(`/api/properties/${id}/images`, {
        method: 'POST',
        body: { image: base64Image }
      });

      if (response.data && property) {
        setProperty({ ...property, images: response.data.images });
        setMessage('Image uploaded successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    try {
      setUploadingProfile(true);
      setError(null);

      // Convert to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update property with profile image
      const response = await apiFetch<Property>(`/api/properties/${id}`, {
        method: 'PUT',
        body: { profileImage: base64Image }
      });

      if (response.data) {
        setProperty(response.data);
        setProfileImagePreview(response.data.profileImage || null);
        setMessage('Profile image uploaded successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error uploading profile image:', err);
      setError(err.message || 'Failed to upload profile image');
    } finally {
      setUploadingProfile(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm('Are you sure you want to delete the profile image?')) {
      return;
    }

    try {
      setError(null);

      const response = await apiFetch<Property>(`/api/properties/${id}`, {
        method: 'PUT',
        body: { profileImage: null }
      });

      if (response.data) {
        setProperty(response.data);
        setProfileImagePreview(null);
        setMessage('Profile image deleted successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error deleting profile image:', err);
      setError(err.message || 'Failed to delete profile image');
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeletingIndex(imageIndex);
      setError(null);

      const response = await apiFetch<{ images: string[] }>(`/api/properties/${id}/images/${imageIndex}`, {
        method: 'DELETE'
      });

      if (response.data && property) {
        setProperty({ ...property, images: response.data.images });
        setMessage('Image deleted successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await apiFetch<Property>(`/api/properties/${id}`, {
        method: 'PUT',
        body: {
          name: formData.name,
          address: formData.address,
          description: formData.description,
          status: formData.status
        }
      });

      if (response.data) {
        setProperty(response.data);
        setMessage('Plantation updated successfully');
        setIsEditing(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating plantation:', err);
      setError(err.message || 'Failed to update plantation');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plantation details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !property) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/admin/field-management')}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Go back to Field Management
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!property) {
    return null;
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
                  onClick={() => navigate('/admin/field-management')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{property.name}</h1>
                  <p className="text-sm text-gray-500">Plantation Details</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit Plantation</span>
                </button>
              )}
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl shadow-lg overflow-hidden relative ${
                  profileImagePreview || property.profileImage
                    ? ''
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}
              >
                {/* Profile Image Background */}
                {profileImagePreview || property.profileImage ? (
                  <div className="absolute inset-0">
                    <img
                      src={profileImagePreview || property.profileImage || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {!isEditing ? (
                        <>
                          <h2 className={`text-3xl font-bold mb-2 ${
                            profileImagePreview || property.profileImage
                              ? 'text-gray-900 drop-shadow-lg bg-white/80 px-4 py-2 rounded-lg inline-block'
                              : 'text-white'
                          }`}>{property.name}</h2>
                          {property.plantation?.name && (
                            <p className={`text-lg mb-2 ${
                              profileImagePreview || property.profileImage
                                ? 'text-gray-800 drop-shadow-lg bg-white/80 px-4 py-1 rounded-lg inline-block'
                                : 'text-white/90'
                            }`}>{property.plantation.name}</p>
                          )}
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-semibold mb-2 ${
                              profileImagePreview || property.profileImage ? 'text-gray-900' : 'text-white'
                            }`}>Plantation Name</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border ${
                      profileImagePreview || property.profileImage
                        ? 'bg-white/90 text-gray-900 border-gray-300'
                        : 'bg-white/20 text-white border-white/30'
                    } ${
                      property.status === 'active'
                        ? ''
                        : property.status === 'inactive'
                        ? 'opacity-75'
                        : ''
                    }`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>

                  {/* Profile Image Upload Section */}
                  <div className="mb-4">
                    <label className={`block text-sm font-semibold mb-2 ${
                      profileImagePreview || property.profileImage ? 'text-gray-900' : 'text-white'
                    }`}>Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                          {profileImagePreview || property.profileImage ? (
                            <img
                              src={profileImagePreview || property.profileImage || ''}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PhotoIcon className="h-12 w-12 text-white" />
                          )}
                        </div>
                        {(profileImagePreview || property.profileImage) && (
                          <button
                            type="button"
                            onClick={handleDeleteProfileImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete profile image"
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
                            onChange={handleProfileImageUpload}
                            className="hidden"
                            disabled={uploadingProfile}
                          />
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all text-white font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {uploadingProfile ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <CloudArrowUpIcon className="h-5 w-5" />
                                <span>{profileImagePreview || property.profileImage ? 'Change Picture' : 'Upload Picture'}</span>
                              </>
                            )}
                          </div>
                        </label>
                        <p className="text-xs text-white/70 mt-1">JPG, PNG or GIF. Max size 5MB</p>
                      </div>
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className={`flex items-center gap-2 mt-4 ${
                      profileImagePreview || property.profileImage
                        ? 'text-gray-900 drop-shadow-lg bg-white/80 px-4 py-2 rounded-lg inline-flex'
                        : 'text-white'
                    }`}>
                      <MapPinIcon className="h-5 w-5" />
                      <span className="font-medium">{property.address}</span>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-white/90 backdrop-blur-sm text-gray-900"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Description</h3>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: property.name || '',
                          address: property.address || '',
                          description: property.description || '',
                          status: property.status || 'active'
                        });
                        setError(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {!isEditing ? (
                  <p className="text-gray-600">{property.description || 'No description provided'}</p>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Enter plantation description..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: property.name || '',
                            address: property.address || '',
                            description: property.description || '',
                            status: property.status || 'active'
                          });
                          setError(null);
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                )}
              </motion.div>

              {/* Images Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Plantation Images</h3>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="h-5 w-5" />
                          <span>Add Image</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {property.images && property.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={`Plantation image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(index)}
                          disabled={deletingIndex === index}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete image"
                        >
                          {deletingIndex === index ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No images uploaded yet</p>
                    <p className="text-sm text-gray-400 mb-4">Click "Add Image" to upload plantation photos</p>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Upload First Image</span>
                      </div>
                    </label>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-4">JPG, PNG or GIF. Max size 5MB per image</p>
              </motion.div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CameraIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Cameras</p>
                      <p className="text-base font-semibold text-gray-900">{property.cameraCount}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="text-base font-semibold text-gray-900">
                        {property.managerId?.name || 'Unassigned'}
                      </p>
                      {property.managerId?.email && (
                        <p className="text-xs text-gray-500">{property.managerId.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-base font-semibold text-gray-900">{formatDate(property.createdAt)}</p>
                    </div>
                  </div>
                  {property.location && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-base font-semibold text-gray-900">
                          {property.location.latitude.toFixed(6)}, {property.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
                <div className="flex items-center gap-3">
                  {property.status === 'active' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  ) : property.status === 'inactive' ? (
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <ClockIcon className="h-6 w-6 text-yellow-500" />
                  )}
                  <span className={`text-base font-semibold ${
                    property.status === 'active'
                      ? 'text-green-600'
                      : property.status === 'inactive'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default PlantationDetailPage;
