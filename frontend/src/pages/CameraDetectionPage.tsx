import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
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
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [modelLoading, setModelLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDetections: 0,
    highConfidence: 0,
    elephantCount: 0,
    tigerCount: 0
  });
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPostTimeRef = useRef<number>(0);
  
  // YOLO verification state
  const [yoloAvailable, setYoloAvailable] = useState(false);
  const [yoloVerifying, setYoloVerifying] = useState(false);
  const [yoloResult, setYoloResult] = useState<any>(null);
  const [showYoloModal, setShowYoloModal] = useState(false);

  // Check YOLO API availability
  useEffect(() => {
    const checkYolo = async () => {
      try {
        const response = await apiFetch<any>('/api/yolo/health');
        setYoloAvailable(response.data.available);
        console.log('YOLO API status:', response.data.available ? 'Available' : 'Unavailable');
      } catch (err) {
        setYoloAvailable(false);
        console.log('YOLO API not available');
      }
    };
    checkYolo();
  }, []);

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        console.log('Loading MobileNet model...');
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log('Model loaded successfully!');
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load detection model. Please refresh the page.');
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();

    return () => {
      // Cleanup
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
    if (!model || !videoRef.current) {
      setError('Model not loaded or camera not started');
      return;
    }

    setIsDetecting(true);
    setError('');

    // Run detection every 2 seconds
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
    if (!model || !videoRef.current || !canvasRef.current) return;

    try {
      // Run prediction
      const predictions = await model.classify(videoRef.current);
      
      if (predictions && predictions.length > 0) {
        // Look for relevant animals in predictions
        const animalPredictions = predictions.filter(p => 
          p.className.toLowerCase().includes('elephant') ||
          p.className.toLowerCase().includes('tiger') ||
          p.className.toLowerCase().includes('leopard') ||
          p.className.toLowerCase().includes('lion') ||
          p.className.toLowerCase().includes('bear') ||
          p.className.toLowerCase().includes('deer') ||
          p.className.toLowerCase().includes('boar')
        );

        // Use highest confidence animal prediction, or top prediction if no animals found
        const topPrediction = animalPredictions.length > 0 
          ? animalPredictions[0] 
          : predictions[0];

        const detection: Detection = {
          label: topPrediction.className,
          confidence: topPrediction.probability,
          timestamp: new Date().toISOString()
        };

        setCurrentDetection(detection);

        // Draw on canvas
        drawDetection(topPrediction.className, topPrediction.probability);

        // If confidence is high enough, post to backend and add to recent detections
        if (topPrediction.probability >= 0.7) {
          const now = Date.now();
          // Only post once every 5 seconds to avoid spam
          if (now - lastPostTimeRef.current > 5000) {
            await postDetection(detection);
            lastPostTimeRef.current = now;
            
            // Add to recent detections
            setRecentDetections(prev => [detection, ...prev.slice(0, 9)]);
            
            // Update stats
            setStats(prev => ({
              totalDetections: prev.totalDetections + 1,
              highConfidence: topPrediction.probability >= 0.85 ? prev.highConfidence + 1 : prev.highConfidence,
              elephantCount: topPrediction.className.toLowerCase().includes('elephant') 
                ? prev.elephantCount + 1 
                : prev.elephantCount,
              tigerCount: topPrediction.className.toLowerCase().includes('tiger') 
                ? prev.tigerCount + 1 
                : prev.tigerCount
            }));
          }
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  const drawDetection = (label: string, confidence: number) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw label and confidence
    const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
    const isAnimal = label.toLowerCase().includes('elephant') || 
                    label.toLowerCase().includes('tiger') ||
                    label.toLowerCase().includes('leopard');
    
    ctx.fillStyle = isAnimal && confidence >= 0.7 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
    ctx.font = 'bold 24px Arial';
    
    const textWidth = ctx.measureText(text).width;
    ctx.fillRect(10, 10, textWidth + 20, 40);
    
    ctx.fillStyle = 'white';
    ctx.fillText(text, 20, 38);

    // Draw confidence bar
    const barWidth = canvas.width - 40;
    const barHeight = 10;
    const barY = canvas.height - 30;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, barY, barWidth, barHeight);
    
    ctx.fillStyle = confidence >= 0.7 ? '#10b981' : '#3b82f6';
    ctx.fillRect(20, barY, barWidth * confidence, barHeight);
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

  const verifyWithYOLO = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not started');
      return;
    }

    setYoloVerifying(true);
    setYoloResult(null);
    
    try {
      // Capture current frame
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg');
      
      console.log('Sending frame to YOLO API for verification...');
      
      // Send to YOLO API via backend
      const response = await apiFetch<any>('/api/yolo/verify', {
        method: 'POST',
        body: {
          image: base64Image,
          confidence: 0.5
        }
      });

      if (response.data.success) {
        setYoloResult(response.data);
        setShowYoloModal(true);
        console.log('YOLO verification complete:', response.data);
        
        // Update stats with YOLO results
        if (response.data.elephant_count > 0 || response.data.tiger_count > 0) {
          setStats(prev => ({
            ...prev,
            elephantCount: prev.elephantCount + response.data.elephant_count,
            tigerCount: prev.tigerCount + response.data.tiger_count,
            totalDetections: prev.totalDetections + 1,
            highConfidence: prev.highConfidence + 1
          }));
        }
      } else {
        setError('YOLO verification failed: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('YOLO verification error:', err);
      setError('YOLO verification failed. Make sure YOLO API is running.');
    } finally {
      setYoloVerifying(false);
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

      {modelLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          Loading AI model... Please wait.
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

                {currentDetection && isDetecting && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{currentDetection.label}</p>
                        <p className="text-sm opacity-75">
                          Confidence: {(currentDetection.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(currentDetection.confidence)}`}>
                        {currentDetection.confidence >= 0.85 ? 'High' : currentDetection.confidence >= 0.70 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                {!stream ? (
                  <button
                    onClick={startCamera}
                    disabled={modelLoading}
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
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
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
              <li>• AI analyzes camera feed every 2 seconds</li>
              <li>• Detections ≥70% confidence are saved</li>
              <li>• Notifications sent to managers</li>
              <li>• Auto-cooldown: 5 seconds between posts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraDetectionPage;

