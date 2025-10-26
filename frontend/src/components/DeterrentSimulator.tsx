import React from 'react';
import { type DetectionEvent } from './Detector';

interface DeterrentSimulatorProps {
  active: boolean;
  lastDetection: DetectionEvent | null;
  isTarget: (label: string) => boolean;
}

const DeterrentSimulator: React.FC<DeterrentSimulatorProps> = ({ active, lastDetection, isTarget }) => {
  if (!active) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="text-gray-500 mb-2">System is idle</div>
        <div className="text-sm text-gray-400">Enable detection to start deterrent simulation</div>
      </div>
    );
  }

  if (!lastDetection) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <div className="text-blue-600 mb-2">Waiting for detection...</div>
        <div className="text-sm text-blue-400">System is monitoring for animal activity</div>
      </div>
    );
  }

  const isAnimalTarget = isTarget(lastDetection.label);
  const confidenceLevel = lastDetection.probability;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-100">
      <h3 className="font-semibold text-gray-900 mb-4">Deterrent Response</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Detected Animal</span>
          <span className="font-medium capitalize">{lastDetection.label}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className="font-medium">{(confidenceLevel * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Target Status</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${isAnimalTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
            {isAnimalTarget ? 'TARGET' : 'IGNORE'}
          </span>
        </div>
        
        {isAnimalTarget && confidenceLevel >= 0.6 && (
          <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
            <div className="text-emerald-800 font-medium">Deterrent Activated!</div>
            <div className="text-sm text-emerald-600">Spraying deterrent at {lastDetection.label}</div>
          </div>
        )}
        
        {isAnimalTarget && confidenceLevel < 0.6 && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
            <div className="text-yellow-800 font-medium">Low Confidence</div>
            <div className="text-sm text-yellow-600">Monitoring {lastDetection.label}</div>
          </div>
        )}
        
        {!isAnimalTarget && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div className="text-gray-800 font-medium">Non-Target Animal</div>
            <div className="text-sm text-gray-600">No deterrent action required</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeterrentSimulator;
