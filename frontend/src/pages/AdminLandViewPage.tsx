import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { 
  MapPinIcon, 
  VideoCameraIcon, 
  PlayIcon, 
  PauseIcon,
  Cog6ToothIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastActivity: string;
  streamUrl: string;
}

const AdminLandViewPage: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const cameras: Camera[] = [
    {
      id: '1',
      name: 'North Field Camera',
      location: 'Field A - North Section',
      status: 'online',
      lastActivity: '2 minutes ago',
      streamUrl: '/api/stream/camera1'
    },
    {
      id: '2',
      name: 'South Field Camera',
      location: 'Field B - South Section',
      status: 'online',
      lastActivity: '1 minute ago',
      streamUrl: '/api/stream/camera2'
    },
    {
      id: '3',
      name: 'East Field Camera',
      location: 'Field C - East Section',
      status: 'maintenance',
      lastActivity: '1 hour ago',
      streamUrl: '/api/stream/camera3'
    },
    {
      id: '4',
      name: 'West Field Camera',
      location: 'Field D - West Section',
      status: 'offline',
      lastActivity: '3 hours ago',
      streamUrl: '/api/stream/camera4'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Land View - Live Cameras</h1>
          <p className="text-gray-600">Monitor your fields with live camera feeds</p>
        </div>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Cameras</h2>
            <div className="space-y-3">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCamera === camera.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCamera(camera.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <VideoCameraIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{camera.name}</h3>
                        <p className="text-sm text-gray-500">{camera.location}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(camera.status)}`}>
                      {camera.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Last activity: {camera.lastActivity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Feed</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isStreaming
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isStreaming ? (
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
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Video Feed Placeholder */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {selectedCamera ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isStreaming ? (
                    <div className="text-center text-white">
                      <VideoCameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Live Feed Active</p>
                      <p className="text-sm opacity-75">
                        {cameras.find(c => c.id === selectedCamera)?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Click Start to Begin Streaming</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <EyeIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a Camera</p>
                    <p className="text-sm opacity-75">Choose a camera from the list to view live feed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Info */}
            {selectedCamera && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Camera Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {cameras.find(c => c.id === selectedCamera)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 text-gray-900">
                      {cameras.find(c => c.id === selectedCamera)?.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      cameras.find(c => c.id === selectedCamera)?.status || 'offline'
                    )}`}>
                      {cameras.find(c => c.id === selectedCamera)?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Activity:</span>
                    <span className="ml-2 text-gray-900">
                      {cameras.find(c => c.id === selectedCamera)?.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandViewPage;
