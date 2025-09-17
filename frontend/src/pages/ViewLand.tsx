import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, VideoCameraIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

const ViewLand: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState('camera1');
  const [isRecording, setIsRecording] = useState(false);

  const cameras = [
    { id: 'camera1', name: 'Zone A', location: 'Forest Edge', status: 'active' },
    { id: 'camera2', name: 'Zone B', location: 'Clearing Area', status: 'active' },
    { id: 'camera3', name: 'Zone C', location: 'Settlement Border', status: 'inactive' },
    { id: 'camera4', name: 'Zone D', location: 'Water Source', status: 'active' },
  ];

  const recentDetections = [
    { time: '2 min ago', animal: 'Tiger', location: 'Zone A', confidence: '95%', deterrentActivated: true },
    { time: '15 min ago', animal: 'Wild Boar', location: 'Zone B', confidence: '87%', deterrentActivated: false },
    { time: '1 hour ago', animal: 'Elephant', location: 'Zone C', confidence: '92%', deterrentActivated: true },
    { time: '3 hours ago', animal: 'Deer', location: 'Zone A', confidence: '78%', deterrentActivated: false },
  ];

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Land</h1>
        <p className="text-gray-600">Monitor your property through live camera feeds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Camera Feeds</h2>
            <div className="space-y-3">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={`w-full p-4 rounded-lg border transition-colors ${
                    selectedCamera === camera.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-medium">{camera.name}</p>
                      <p className="text-sm text-gray-500">{camera.location}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Controls</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <PauseIcon className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <CameraIcon className="h-5 w-5" />
                <span>Take Snapshot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Camera Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {cameras.find(c => c.id === selectedCamera)?.name}
                  </h2>
                  <p className="text-gray-500">
                    {cameras.find(c => c.id === selectedCamera)?.location}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-500">LIVE</span>
                </div>
              </div>
            </div>

            <div className="relative bg-gray-900 aspect-video">
              <img
                src="https://images.pexels.com/photos/4274439/pexels-photo-4274439.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Live camera feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                No threats detected
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                {cameras.find(c => c.id === selectedCamera)?.name}
              </div>
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>REC</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Detections */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Detections</h3>
            <div className="space-y-3">
              {recentDetections.map((detection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CameraIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{detection.animal}</p>
                      <p className="text-sm text-gray-500">{detection.location}</p>
                      {detection.deterrentActivated && (
                        <p className="text-xs text-red-600 font-medium">Deterrent Activated</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{detection.confidence}</p>
                    <p className="text-xs text-gray-500">{detection.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLand;
