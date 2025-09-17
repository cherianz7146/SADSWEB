import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

const DeterrentReport: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data for charts
  const deterrentData = {
    '24h': { total: 12, successful: 10, failed: 2 },
    '7d': { total: 89, successful: 78, failed: 11 },
    '30d': { total: 342, successful: 298, failed: 44 },
  };

  const animalTypes = [
    { name: 'Tiger', count: 45, percentage: 35, deterrentActivated: true },
    { name: 'Elephant', count: 32, percentage: 25, deterrentActivated: true },
    { name: 'Wild Boar', count: 28, percentage: 22, deterrentActivated: true },
    { name: 'Deer', count: 15, percentage: 12, deterrentActivated: false },
    { name: 'Other', count: 8, percentage: 6, deterrentActivated: false },
  ];

  const hourlyData = [
    { hour: '00:00', detections: 2 },
    { hour: '02:00', detections: 1 },
    { hour: '04:00', detections: 3 },
    { hour: '06:00', detections: 8 },
    { hour: '08:00', detections: 12 },
    { hour: '10:00', detections: 15 },
    { hour: '12:00', detections: 18 },
    { hour: '14:00', detections: 22 },
    { hour: '16:00', detections: 19 },
    { hour: '18:00', detections: 25 },
    { hour: '20:00', detections: 16 },
    { hour: '22:00', detections: 9 },
  ];

  const currentData = deterrentData[selectedPeriod as keyof typeof deterrentData];

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deterrent Reports</h1>
        <p className="text-gray-600">Analyze deterrent effectiveness and animal activity patterns</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Report Period</h2>
          <div className="flex space-x-2">
            {[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Deterrents</p>
              <p className="text-2xl font-bold text-gray-900">{currentData.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-600">{currentData.successful}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{currentData.failed}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animal Types Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Animal Types Detected</h3>
          <div className="space-y-4">
            {animalTypes.map((animal, index) => (
              <motion.div
                key={animal.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    animal.deterrentActivated ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900">{animal.name}</span>
                  {animal.deterrentActivated && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      Deterrent
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${animal.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {animal.count}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hourly Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Activity Pattern</h3>
          <div className="space-y-3">
            {hourlyData.map((data, index) => (
              <motion.div
                key={data.hour}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-600 w-12">{data.hour}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(data.detections / 25) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">
                  {data.detections}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Deterrent Success Rate</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(currentData.successful / currentData.total) * 251.2} 251.2`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round((currentData.successful / currentData.total) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeterrentReport;
