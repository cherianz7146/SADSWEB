import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  StopCircleIcon, 
  PlayCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';
import { apiFetch } from '../utils/api';

interface Detection {
  label: string;
  confidence: number;
  timestamp: string;
}

const CameraDetectionPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalDetections: 0,
    highConfidence: 0,
    elephantCount: 0,
    tigerCount: 0
  });
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPostTimeRef = useRef<number>(0);
  
  // YOLO API state
  const [yoloAvailable, setYoloAvailable] = useState(false);

  // Check YOLO API availability
  useEffect(() => {
    const checkYolo = async () => {
      try {
        console.log('🔍 Checking YOLO API health...');
        const response = await apiFetch<any>('/api/yolo/health');
        console.log('📦 YOLO API health response:', response);
        console.log('📦 Response data:', response.data);
        
        // Check if YOLO API is available
        // Must have both available=true AND model_loaded=true for full functionality
        // Handle both boolean true and string "true" cases
        const available = response.data?.available;
        const modelLoaded = response.data?.model_loaded;
        
        // Convert to boolean if needed (handle string "true" or boolean true)
        const isAvailableBool = available === true || available === 'true' || available === 'True';
        const isModelLoadedBool = modelLoaded === true || modelLoaded === 'true' || modelLoaded === 'True';
        
        const isAvailable = isAvailableBool && isModelLoadedBool;
        
        console.log('✅ YOLO API available:', isAvailable);
        console.log('   - available:', available, '(type:', typeof available, ')');
        console.log('   - model_loaded:', modelLoaded, '(type:', typeof modelLoaded, ')');
        console.log('   - status:', response.data?.status);
        
        setYoloAvailable(isAvailable);
        console.log('YOLO API status:', isAvailable ? '✅ Available' : '❌ Unavailable');
        if (!isAvailable) {
          console.warn('⚠️ YOLO API not available. Full response:', JSON.stringify(response.data, null, 2));
        }
      } catch (err: any) {
        setYoloAvailable(false);
        console.error('❌ YOLO API health check failed:', err);
        console.error('   Error message:', err.message);
        console.error('   Error response:', err.response?.data);
        console.error('   Error stack:', err.stack);
      }
    };
    // Check immediately
    checkYolo();
    
    // Check periodically (every 5 seconds for faster updates)
    const interval = setInterval(checkYolo, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(interval);
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'environment' // Prefer back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopDetection();
  };

  const startDetection = () => {
    if (!videoRef.current || !stream) {
      setError('Camera not started');
      return;
    }

    if (!yoloAvailable) {
      setError('YOLO API is not available. Please ensure the YOLO service is running.');
      return;
    }

    setIsDetecting(true);
    setError('');

    // Run detection every 2 seconds (same as ESP32 camera)
    detectionIntervalRef.current = setInterval(async () => {
      await runDetection();
    }, 2000);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const runDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      // Capture current frame from video
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('🔍 Sending webcam frame to YOLO API for detection...');
      
      // Send to YOLO API via backend (same as ESP32 camera)
      // Use lower confidence threshold (0.25 = 25%) for better detection
      const response = await apiFetch<any>('/api/yolo/verify', {
        method: 'POST',
        body: {
          image: base64Image,
          confidence: 0.25  // Lowered to 0.25 for better detection accuracy
        }
      });

      // Process the response (same logic as ESP32 camera)
      await processDetectionResponse(response);
    } catch (err: any) {
      console.error('❌ Detection error:', err);
      console.error('Error details:', err.message, err.response?.data);
      
      // Check if it's a YOLO API error
      if (err.response?.status === 503 || err.message?.includes('YOLO') || err.message?.includes('ECONNREFUSED')) {
        console.error('⚠️ YOLO API is not available. Please ensure:');
        console.error('   1. YOLO API service is running on http://localhost:5001');
        console.error('   2. Check backend/.env for YOLO_API_URL setting');
        console.error('   3. Start the YOLO service: cd ml && python yolo_api.py');
        setYoloAvailable(false);
        
        // Show error state in UI
        setCurrentDetection({
          label: 'YOLO API Unavailable',
          confidence: 0,
          timestamp: new Date().toISOString()
        });
      } else {
        // For other errors, show analyzing state
        setCurrentDetection({
          label: 'Detection Error',
          confidence: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  // Helper function to process detection response (same as ESP32 camera)
  const processDetectionResponse = async (response: any) => {
    console.log('📦 Processing detection response:', response.data);
    
    // Update YOLO availability status
    setYoloAvailable(true);

    // Check for detections in various possible formats
    let detections = [];
    if (response.data.detections && Array.isArray(response.data.detections)) {
      detections = response.data.detections;
      console.log(`Found detections in 'detections' array: ${detections.length}`);
    } else if (response.data.animal_detections && Array.isArray(response.data.animal_detections)) {
      detections = response.data.animal_detections;
      console.log(`Found detections in 'animal_detections' array: ${detections.length}`);
    } else if (response.data.total_detections > 0 && response.data.detections) {
      detections = Array.isArray(response.data.detections) ? response.data.detections : [];
      console.log(`Found ${response.data.total_detections} total detections`);
    }

    if (detections.length > 0) {
      console.log(`✅ Found ${detections.length} detection(s)`);
      
      // Sort by confidence (highest first)
      detections.sort((a: any, b: any) => {
        const confA = typeof a.confidence === 'number' ? a.confidence : parseFloat(a.confidence || '0');
        const confB = typeof b.confidence === 'number' ? b.confidence : parseFloat(b.confidence || '0');
        return confB - confA;
      });
      
      // Get the highest confidence detection
      const topDetection = detections[0];
      
      // Handle confidence format (could be 0-100 or 0-1)
      let confidenceValue = topDetection.confidence;
      if (typeof confidenceValue === 'string') {
        confidenceValue = parseFloat(confidenceValue);
      }
      // If confidence is > 1, it's a percentage (0-100), convert to decimal (0-1)
      if (confidenceValue > 1) {
        confidenceValue = confidenceValue / 100;
      }
      
      const detection: Detection = {
        label: topDetection.name || topDetection.label || 'Unknown',
        confidence: confidenceValue,
        timestamp: new Date().toISOString()
      };

      console.log(`🎯 Detection: ${detection.label} (${(detection.confidence * 100).toFixed(1)}%)`);

      // ALWAYS show detection result with confidence
      setCurrentDetection(detection);
      drawDetectionResult(detection.label, detection.confidence);

      // If confidence is high enough (50% or more), save and notify
      // Increased threshold to reduce false positives
      if (detection.confidence >= 0.5) {
        const now = Date.now();
        // Only post once every 3 seconds to avoid spam
        if (now - lastPostTimeRef.current > 3000) {
          console.log('💾 Saving detection to database...');
          try {
            await postDetection(detection);
            lastPostTimeRef.current = now;
            
            // Add to recent detections
            setRecentDetections(prev => [detection, ...prev.slice(0, 9)]);
            
            // Update stats
            const labelLower = detection.label.toLowerCase();
            setStats(prev => ({
              totalDetections: prev.totalDetections + 1,
              highConfidence: detection.confidence >= 0.85 ? prev.highConfidence + 1 : prev.highConfidence,
              elephantCount: labelLower.includes('elephant') 
                ? prev.elephantCount + 1 
                : prev.elephantCount,
              tigerCount: labelLower.includes('tiger') || labelLower.includes('cat')
                ? prev.tigerCount + 1 
                : prev.tigerCount
            }));
            
            console.log('✅ Detection saved and stats updated');
          } catch (postError) {
            console.error('❌ Failed to save detection:', postError);
          }
        }
      } else {
        console.log(`⚠️ Detection confidence too low to save: ${(detection.confidence * 100).toFixed(1)}% (minimum: 30%)`);
      }
    } else {
      console.log('❌ No detections found in response');
      // Show "No detection" state
      const noDetection: Detection = {
        label: 'No detection',
        confidence: 0,
        timestamp: new Date().toISOString()
      };
      setCurrentDetection(noDetection);
      drawDetectionResult(noDetection.label, noDetection.confidence);
    }
  };

  const drawDetectionResult = (label: string, confidence: number) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skip drawing if confidence is 0 and label indicates no detection/error
    if (confidence === 0 && (label === 'No detection' || label === 'Analyzing...' || label.includes('Error') || label.includes('Unavailable'))) {
      return;
    }

    const isAnimal = label.toLowerCase().includes('elephant') || 
                    label.toLowerCase().includes('tiger') ||
                    label.toLowerCase().includes('leopard') ||
                    label.toLowerCase().includes('deer') ||
                    label.toLowerCase().includes('boar');
    
    // Draw detection overlay in bottom-left corner (same style as ESP32 camera)
    const padding = 15;
    const overlayX = padding;
    const overlayY = canvas.height - 120;
    const overlayWidth = 300;
    const overlayHeight = 100;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
    
    // Label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(label, overlayX + 10, overlayY + 30);
    
    // Confidence percentage
    ctx.font = '16px Arial';
    ctx.fillText(`${(confidence * 100).toFixed(1)}%`, overlayX + 10, overlayY + 55);
    
    // Confidence bar
    const barWidth = overlayWidth - 20;
    const barHeight = 8;
    const barX = overlayX + 10;
    const barY = overlayY + 70;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Confidence fill
    let barColor = '#3b82f6'; // Blue for low
    if (confidence >= 0.85) {
      barColor = '#10b981'; // Green for high
    } else if (confidence >= 0.70) {
      barColor = '#f59e0b'; // Yellow for medium
    }
    
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * confidence, barHeight);
  };

  const postDetection = async (detection: Detection) => {
    try {
      // Normalize label to match backend expectations
      let normalizedLabel = detection.label;
      if (detection.label.toLowerCase().includes('elephant')) {
        normalizedLabel = 'Elephant';
      } else if (detection.label.toLowerCase().includes('tiger')) {
        normalizedLabel = 'Tiger';
      }

      // Simple detection data - backend will handle user info automatically
      const detectionData = {
        label: normalizedLabel,
        probability: detection.confidence,
        confidence: detection.confidence * 100,
        source: 'browser-camera',
        detectedAt: detection.timestamp
      };

      await apiFetch('/api/detections', {
        method: 'POST',
        body: detectionData
      });

      console.log('Detection posted to backend:', normalizedLabel, detection.confidence);
    } catch (err) {
      console.error('Failed to post detection:', err);
    }
  };


  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600 bg-green-100';
    if (confidence >= 0.70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-8">
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Camera Detection</h1>
        <p className="text-gray-600">Real-time animal detection using your camera</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Detections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDetections}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <BellIcon className="h-6 w-6" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">High Confidence</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highConfidence}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Elephants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.elephantCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tigers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tigerCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <XCircleIcon className="h-5 w-5" />
          {error}
        </div>
      )}

      {!yoloAvailable && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold mb-1">YOLO API Not Available</p>
              <p className="text-sm mb-2">The YOLO detection service is not running. Please start it to enable camera detection.</p>
              <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                <p className="text-xs font-mono text-yellow-900 mb-1">To start the YOLO API:</p>
                <ol className="text-xs text-yellow-900 list-decimal list-inside space-y-1">
                  <li>Open a terminal/command prompt</li>
                  <li>Navigate to the project directory: <code className="bg-yellow-200 px-1 rounded">cd D:\SADS2</code></li>
                  <li>Start the service: <code className="bg-yellow-200 px-1 rounded">cd ml && python yolo_api.py</code></li>
                  <li>Wait for "Starting SADS YOLO API on port 5001" message</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Camera Feed</h2>
            </div>
            
            <div className="p-6">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
                
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Camera not started</p>
                    </div>
                  </div>
                )}

                {/* Detection overlay (same as ESP32 camera) */}
                {currentDetection && isDetecting && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg z-20 border-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        currentDetection.confidence >= 0.85 ? 'bg-green-500' :
                        currentDetection.confidence >= 0.70 ? 'bg-yellow-500' :
                        currentDetection.confidence >= 0.50 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-xs font-semibold">{currentDetection.label}</p>
                        <p className="text-xs opacity-75">
                          {currentDetection.confidence >= 0.85 ? 'High' : 
                           currentDetection.confidence >= 0.70 ? 'Medium' : 
                           currentDetection.confidence >= 0.50 ? 'Low' : 'Very Low'} Confidence
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                {!stream ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CameraIcon className="h-5 w-5" />
                    Start Camera
                  </button>
                ) : (
                  <>
                    {!isDetecting ? (
                      <button
                        onClick={startDetection}
                        disabled={!yoloAvailable}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlayCircleIcon className="h-5 w-5" />
                        Start Detection
                      </button>
                    ) : (
                      <button
                        onClick={stopDetection}
                        className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <StopCircleIcon className="h-5 w-5" />
                        Stop Detection
                      </button>
                    )}
                    
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Stop Camera
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Detections */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Detections</h2>
            </div>
            
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {recentDetections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No detections yet</p>
                  <p className="text-xs mt-1">Start detection to see results</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDetections.map((detection, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{detection.label}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(detection.confidence)}`}>
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(detection.timestamp).toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• YOLO AI analyzes camera feed every 2 seconds</li>
              <li>• Detections ≥25% confidence are saved</li>
              <li>• Same detection system as ESP32 cameras</li>
              <li>• Notifications sent to managers</li>
              <li>• Auto-cooldown: 3 seconds between posts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraDetectionPage;

