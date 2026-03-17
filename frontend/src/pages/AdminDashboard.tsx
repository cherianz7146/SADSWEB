import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { 
  CameraIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  ChartBarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  PlayCircleIcon,
  StopCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

interface Device {
  _id: string;
  serialNumber: string;
  type: string;
  status: string;
  assignedProperty: {
    _id: string;
    name: string;
  } | string;
  metadata?: {
    ipAddress?: string;
    streamUrl?: string;
  };
}

interface Detection {
  label: string;
  confidence: number;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, managers: 0 },
    properties: { total: 0, active: 0, totalCameras: 0 },
    detections: { today: 0, last24h: 0, total: 0 }
  });

  // Detection state
  const streamImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    highConfidence: 0,
    elephantCount: 0,
    tigerCount: 0
  });
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPostTimeRef = useRef<number>(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get ESP32 camera stream URL (MJPEG streams - no cache-busting needed)
  // Use direct ESP32 URL by default (more reliable than proxy)
  // Proxy can be used as fallback if needed
  const getEsp32StreamUrl = (device: Device | null, forceRefresh: boolean = false, useProxy: boolean = false) => {
    if (!device) {
      console.warn('⚠️ getEsp32StreamUrl: No device provided');
      return null;
    }
    
    let esp32StreamUrl = '';
    
    // Get the actual ESP32 stream URL
    if (device.metadata?.streamUrl) {
      esp32StreamUrl = device.metadata.streamUrl;
    } else if (device.metadata?.ipAddress) {
      esp32StreamUrl = `http://${device.metadata.ipAddress}/stream`;
    } else {
      // Default fallback
      const deviceIp = '10.82.225.44';
      esp32StreamUrl = `http://${deviceIp}/stream`;
      console.warn('⚠️ No metadata found, using default IP:', esp32StreamUrl);
    }
    
    // Use direct ESP32 URL by default (more reliable)
    // Only use proxy if explicitly requested (proxy has been timing out)
    if (useProxy) {
      const proxyUrl = `/api/stream/proxy?streamUrl=${encodeURIComponent(esp32StreamUrl)}`;
      const finalUrl = forceRefresh ? `${proxyUrl}&_t=${Date.now()}` : proxyUrl;
      console.log('📹 Using backend proxy for stream:', finalUrl);
      console.log('   Original ESP32 URL:', esp32StreamUrl);
      return finalUrl;
    }
    
    // Default: Use direct ESP32 URL (works better, avoids proxy timeout issues)
    // Always add timestamp for cache-busting (MJPEG streams need this to reload)
    const timestamp = Date.now();
    const finalUrl = `${esp32StreamUrl}?t=${timestamp}`;
    console.log('📹 Using direct ESP32 URL for stream:', finalUrl);
    console.log('📹 Base URL:', esp32StreamUrl);
    return finalUrl;
  };

  const fetchStats = async () => {
    try {
      const response = await apiFetch<{
        users: { total: number; admins: number; managers: number };
        properties: { total: number; active: number; totalCameras: number };
        detections: { today: number; last24h: number; total: number };
      }>('/api/stats/admin');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const fetchDevices = async () => {
    try {
        // Use device health endpoint which returns all devices for admin
        const healthResponse = await apiFetch<{ devices: Device[] }>('/api/devices/health');
        console.log('🔍 Device Health Response:', healthResponse);
        console.log('📦 Response Data:', healthResponse.data);
        
        if (healthResponse.data && healthResponse.data.devices) {
          const allDevices = healthResponse.data.devices;
          console.log('📋 All devices received:', allDevices);
          console.log('📊 Device count:', allDevices.length);
          setDevices(allDevices);
          
          // Filter ESP32 cameras
          const esp32Cameras = allDevices.filter(
            (d: Device) => d.type === 'camera' && d.serialNumber && d.serialNumber.startsWith('ESP32')
          );
          console.log('📷 ESP32 cameras found:', esp32Cameras);
          console.log('📷 ESP32 camera count:', esp32Cameras.length);
          
          // Auto-select first ESP32 camera if available (online or offline)
          if (esp32Cameras.length > 0) {
            const esp32Camera = esp32Cameras[0];
            console.log('✅ Auto-selecting ESP32 camera:', esp32Camera);
            console.log('📡 Device metadata:', esp32Camera.metadata);
            console.log('📡 Device IP:', esp32Camera.metadata?.ipAddress || 'Not set');
            console.log('📡 Device status:', esp32Camera.status);
            setSelectedDevice(esp32Camera);
            // Don't auto-enable - let user click "Start Camera" button
            const streamUrl = getEsp32StreamUrl(esp32Camera);
            console.log('✅ ESP32 camera ready, stream URL:', streamUrl);
            if (!esp32Camera.metadata?.ipAddress && !esp32Camera.metadata?.streamUrl) {
              console.warn('⚠️ ESP32 camera has no IP address in metadata. Make sure ESP32 is sending heartbeats.');
              console.warn('   Expected static IP: 10.82.225.44');
            }
          } else {
            console.warn('⚠️ No ESP32 cameras found in device list');
            console.warn('   Available devices:', allDevices.map(d => `${d.serialNumber} (${d.type})`));
            console.warn('   💡 If ESP32 is powered on, it should auto-register via heartbeat.');
            console.warn('   💡 Check ESP32 serial monitor to verify it\'s connecting to WiFi and sending heartbeats.');
          }
        } else {
          console.error('❌ No devices in health response');
          console.error('   Full response:', healthResponse);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch devices:', error);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
  };

  // Expose fetchDevices for manual refresh
  (window as any).refreshDevices = fetchDevices;

  // Detection state
  const [yoloAvailable, setYoloAvailable] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiFetch<{ success: boolean; count: number }>('/api/notifications/unread-count');
      if (response.data && response.data.success) {
        setUnreadNotificationCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  };

  // Force stream reload when camera is enabled or device changes
  useEffect(() => {
    if (!cameraEnabled || !selectedDevice) {
      // Clear stream when camera is disabled
      if (streamImgRef.current) {
        streamImgRef.current.src = '';
      }
      return;
    }
    
    const streamUrl = getEsp32StreamUrl(selectedDevice);
    console.log('📹 Camera enabled');
    console.log('📹 Stream URL:', streamUrl);
    console.log('📹 Device:', selectedDevice.serialNumber);
    console.log('📹 Device metadata:', selectedDevice.metadata);
    
    if (!streamUrl) {
      console.error('❌ No stream URL available for device');
      return;
    }
    
    // Show loading indicator
    const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
    if (loadingDiv) {
      loadingDiv.style.display = 'flex';
    }
    
    // Periodic check to see if stream loaded (MJPEG streams may not trigger onLoad)
    // Check more frequently initially, then less frequently
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      if (streamImgRef.current && cameraEnabled) {
        const img = streamImgRef.current;
        const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
        checkCount++;
        
        // Check if image has valid dimensions (means it loaded)
        // For MJPEG streams, we also check if the image src is set and image is loading
        const hasDimensions = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        const isStreaming = img.src && img.src.includes('stream') && (img.complete || img.naturalWidth > 0);
        
        if (hasDimensions || (isStreaming && checkCount > 2)) {
          console.log('✅ Stream loaded (detected via periodic check)');
          console.log('   Dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          console.log('   Complete:', img.complete);
          if (loadingDiv) {
            loadingDiv.style.display = 'none';
          }
          clearInterval(checkInterval);
        } else {
          // Log status every 2 seconds for debugging (more frequent)
          const elapsed = Math.floor((Date.now() - (window as any).streamStartTime) / 1000);
          if (elapsed > 0 && elapsed % 2 === 0) {
            console.log(`⏱️ Stream check (${elapsed}s):`, {
              complete: img.complete,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              src: img.src.substring(0, 50) + '...',
              checkCount: checkCount
            });
          }
        }
      } else {
        clearInterval(checkInterval);
      }
    }, 500); // Check every 500ms for faster detection
    
    // Store start time for elapsed time tracking
    (window as any).streamStartTime = Date.now();
    
    // Auto-hide loading indicator after 10 seconds if still loading (reduced from 15s)
    const loadingTimeout = setTimeout(() => {
      const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
      if (loadingDiv && streamImgRef.current) {
        const img = streamImgRef.current;
        const hasDimensions = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        const isStreaming = img.src && img.src.includes('stream');
        
        if (hasDimensions || isStreaming) {
          console.log('✅ Stream loaded (detected via timeout check)');
          loadingDiv.style.display = 'none';
        } else {
          console.warn('⚠️ Stream still loading after 10 seconds');
          console.warn('   Image complete:', img.complete);
          console.warn('   Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          console.warn('   Stream URL:', streamUrl);
          console.warn('   💡 This might be normal for MJPEG streams. The stream may still be loading.');
          console.warn('   💡 Try opening the stream URL directly in a new tab: ' + streamUrl);
          // Hide loading indicator anyway to show the stream area (even if blank)
          loadingDiv.style.display = 'none';
        }
      }
      clearInterval(checkInterval);
    }, 10000); // Reduced to 10 seconds
    
    // Set image src immediately and also after a short delay to ensure it updates
    if (streamImgRef.current) {
      console.log('🔄 Setting image src to:', streamUrl);
      console.log('📡 Device IP from metadata:', selectedDevice.metadata?.ipAddress);
      console.log('📡 Device streamUrl from metadata:', selectedDevice.metadata?.streamUrl);
      console.log('📡 Final stream URL:', streamUrl);
      
      // For MJPEG streams, we need to set the src directly without clearing first
      // Clearing can break MJPEG stream connections
      if (streamImgRef.current.src !== streamUrl) {
        console.log('✅ Setting image src to:', streamUrl);
        streamImgRef.current.src = streamUrl;
      }
      
      // Make sure image is visible
      streamImgRef.current.style.display = 'block';
      streamImgRef.current.style.visibility = 'visible';
      streamImgRef.current.style.opacity = '1';
      
      // Preload the stream by setting src immediately
      // MJPEG streams start loading as soon as src is set
      console.log('🚀 Stream URL set, starting load...');
      
      // Add a small delay check to see if stream starts quickly
      setTimeout(() => {
        if (streamImgRef.current) {
          const img = streamImgRef.current;
          if (img.naturalWidth > 0 || img.complete) {
            console.log('✅ Stream started quickly!');
            const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
            if (loadingDiv) {
              loadingDiv.style.display = 'none';
            }
          } else {
            console.log('⏳ Stream still initializing (this is normal for MJPEG)');
          }
        }
      }, 1000); // Check after 1 second
    } else {
      console.warn('⚠️ Image ref not available, will retry...');
      // Retry after a short delay if ref isn't ready
      const retryTimeout = setTimeout(() => {
        if (streamImgRef.current && streamUrl && cameraEnabled) {
          console.log('🔄 Retry: Setting image src to:', streamUrl);
          streamImgRef.current.src = streamUrl;
          streamImgRef.current.style.display = 'block';
        }
      }, 500);
      return () => {
        clearTimeout(loadingTimeout);
        clearTimeout(retryTimeout);
      };
    }
    
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(checkInterval);
    };
  }, [cameraEnabled, selectedDevice?._id]);

  // Check YOLO API availability on mount and fetch notifications
  useEffect(() => {
    const checkYolo = async () => {
      try {
        const response = await apiFetch<any>('/api/yolo/health');
        console.log('📦 YOLO API health response:', response.data);
        
        // Must have both available=true AND model_loaded=true for full functionality
        // Handle both boolean true and string "true" cases
        const available = response.data?.available;
        const modelLoaded = response.data?.model_loaded;
        
        // Convert to boolean if needed (handle string "true" or boolean true)
        const isAvailableBool = available === true || available === 'true' || available === 'True';
        const isModelLoadedBool = modelLoaded === true || modelLoaded === 'true' || modelLoaded === 'True';
        
        const isAvailable = isAvailableBool && isModelLoadedBool;
        
        setYoloAvailable(isAvailable);
        console.log('YOLO API status:', isAvailable ? '✅ Available' : '❌ Unavailable');
        console.log('   - available:', available, '(type:', typeof available, ')');
        console.log('   - model_loaded:', modelLoaded, '(type:', typeof modelLoaded, ')');
        if (!isAvailable) {
          console.warn('⚠️ YOLO API is not available. Detection will not work.');
          console.warn('   Full response:', JSON.stringify(response.data, null, 2));
        }
      } catch (err: any) {
        setYoloAvailable(false);
        console.error('❌ YOLO API check failed:', err);
        console.error('   Error:', err.message || err);
        console.error('   Error response:', err.response?.data);
      }
    };
    checkYolo();
    fetchUnreadNotifications();

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }

    // Poll for new notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  const startDetection = async () => {
    if (!streamImgRef.current) {
      console.error('Stream image not available');
      return;
    }
    
    // Re-check YOLO availability before starting (silently)
    try {
      const healthCheck = await apiFetch<any>('/api/yolo/health');
      if (healthCheck.data.available) {
        setYoloAvailable(true);
        console.log('✅ YOLO API is available');
      } else {
        console.warn('⚠️ YOLO API health check returned unavailable');
        setYoloAvailable(false);
        // Still try to start - the detection function will handle errors gracefully
      }
    } catch (err) {
      console.warn('⚠️ YOLO health check failed, but continuing anyway:', err);
      setYoloAvailable(false);
      // Still try to start - the detection function will handle errors gracefully
    }
    
    setIsDetecting(true);
    console.log('🔍 Starting detection...');
    
    // Run detection every 2 seconds for more responsive detection (same as webcam)
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
    if (!selectedDevice) {
      console.warn('No device selected');
      return;
    }

    try {
      // Get the actual ESP32 stream URL for detection
      // The backend will fetch frames from this URL and send to YOLO
      let esp32StreamUrl = '';
      if (selectedDevice.metadata?.streamUrl) {
        esp32StreamUrl = selectedDevice.metadata.streamUrl;
      } else if (selectedDevice.metadata?.ipAddress) {
        esp32StreamUrl = `http://${selectedDevice.metadata.ipAddress}/stream`;
      } else {
        // Default fallback
        esp32StreamUrl = 'http://10.82.225.44/stream';
        console.warn('⚠️ No metadata found, using default IP:', esp32StreamUrl);
      }

      console.log('🔍 Running detection on ESP32 stream...');
      console.log('   ESP32 Stream URL:', esp32StreamUrl);
      console.log('   Device:', selectedDevice.serialNumber);
      
      // Use the detect-from-url endpoint which:
      // 1. Fetches a frame from the ESP32 stream URL
      // 2. Sends it to YOLO API for detection
      // 3. Returns detection results
      const response = await apiFetch<any>('/api/yolo/detect-from-url', {
        method: 'POST',
        body: {
          streamUrl: esp32StreamUrl, // Direct ESP32 URL (http://10.82.225.44/stream)
          confidence: 0.25  // Lower threshold for better detection accuracy
        }
      });

      console.log('✅ Detection response received:', response.data);
      
      // Process the response
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

  // Helper function to process detection response
  const processDetectionResponse = async (response: any) => {
    console.log('📦 Processing detection response:', response.data);
    
    // Update YOLO availability status - if we got a response, YOLO is working
    setYoloAvailable(true);

    // Check for detections in various possible formats
    let detections = [];
    
    // Log full response for debugging
    console.log('📦 Full detection response:', JSON.stringify(response.data, null, 2));
    console.log('📦 Response keys:', Object.keys(response.data));
    
    // Try detections array first (most common) - check even if length is 0
    if (response.data.detections && Array.isArray(response.data.detections)) {
      detections = response.data.detections;
      console.log(`✅ Found ${detections.length} detection(s) in 'detections' array`);
    } 
    // Try animal_detections array as fallback
    else if (response.data.animal_detections && Array.isArray(response.data.animal_detections)) {
      detections = response.data.animal_detections;
      console.log(`✅ Found ${detections.length} detection(s) in 'animal_detections' array`);
    } 
    // Check if total_detections indicates there should be detections
    else if (response.data.total_detections > 0) {
      if (response.data.detections && Array.isArray(response.data.detections)) {
        detections = response.data.detections;
        console.log(`✅ Found ${detections.length} detection(s) via total_detections check`);
      } else {
        console.warn('⚠️ total_detections > 0 but detections array is missing or empty');
      }
    }
    
    // Log detection structure for debugging
    if (detections.length > 0) {
      console.log('🔍 Sample detection structure:', JSON.stringify(detections[0], null, 2));
      console.log('🔍 Detection fields:', Object.keys(detections[0]));
      console.log('🔍 Confidence value:', detections[0].confidence, 'Type:', typeof detections[0].confidence);
    } else {
      console.warn('⚠️ No detections found in any format');
      console.warn('   total_detections:', response.data.total_detections);
      console.warn('   detections exists?', !!response.data.detections);
      console.warn('   detections is array?', Array.isArray(response.data.detections));
      console.warn('   detections length:', response.data.detections?.length);
    }

    // Log if no detections found
    if (detections.length === 0) {
      console.log('⚠️ No detections found in response');
      // Show "No detection" state with 0% confidence
      const noDetection: Detection = {
        label: 'No detection',
        confidence: 0,
        timestamp: new Date().toISOString()
      };
      setCurrentDetection(noDetection);
      drawDetectionResult(noDetection.label, noDetection.confidence);
      return; // Exit early if no detections
    }

    // Process detections
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

        // ALWAYS show detection result with confidence, regardless of confidence level
        setCurrentDetection(detection);
        drawDetectionResult(detection.label, detection.confidence);

        // If confidence is high enough (65% or more), save and notify
        // Increased threshold to reduce false positives (52-54% is too low)
        if (detection.confidence >= 0.65) {
          const now = Date.now();
          // Only post once every 3 seconds to avoid spam but ensure notifications
          if (now - lastPostTimeRef.current > 3000) {
            console.log('💾 Saving detection to database...');
            try {
              await postDetection(detection);
              lastPostTimeRef.current = now;
              
              // Add to recent detections
              setRecentDetections(prev => [detection, ...prev.slice(0, 9)]);
              
              // Update stats
              const labelLower = detection.label.toLowerCase();
              setDetectionStats(prev => ({
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
            } catch (postError: any) {
              console.error('❌ Failed to save detection:', postError);
              console.error('   Error details:', postError.response?.data || postError.message);
              console.error('   Detection data that failed:', detectionData);
              
              // Show user-friendly error notification
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification('⚠️ Detection Save Failed', {
                    body: `Failed to save detection: ${postError.message || 'Unknown error'}. Check console for details.`,
                    icon: '/favicon.ico',
                    tag: `detection-error-${Date.now()}`
                  });
                } catch (notifErr) {
                  console.error('Failed to show error notification:', notifErr);
                }
              }
            }
          } else {
            console.log('⏳ Waiting before posting next detection...');
          }
        } else {
          console.log(`⚠️ Detection confidence too low to save: ${(detection.confidence * 100).toFixed(1)}% (minimum: 65%)`);
          // Still show the detection on screen even if confidence is low (for monitoring)
          // But don't save or notify for low confidence detections
        }
    }
  };

  const drawDetectionResult = (label: string, confidence: number) => {
    const canvas = canvasRef.current;
    const img = streamImgRef.current;
    
    if (!canvas) {
      console.warn('⚠️ Canvas ref not available for drawing detection');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Could not get canvas context');
      return;
    }

    // Set canvas size to match the image if available, otherwise use container size
    if (img && img.complete && img.naturalWidth > 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    } else {
      // Fallback: use container dimensions
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      } else {
        // Default dimensions
        canvas.width = 640;
        canvas.height = 480;
      }
    }

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skip drawing if confidence is 0 and label indicates no detection/error
    if (confidence === 0 && (label === 'No detection' || label === 'Analyzing...' || label.includes('Error') || label.includes('Unavailable'))) {
      // Don't draw canvas overlay for these states - UI overlay will show them
      return;
    }

    const isAnimal = label.toLowerCase().includes('elephant') || 
                    label.toLowerCase().includes('tiger') ||
                    label.toLowerCase().includes('leopard') ||
                    label.toLowerCase().includes('deer') ||
                    label.toLowerCase().includes('boar');
    
    // Draw detection overlay in bottom-left corner (similar to the other detection interface)
    const padding = 15;
    const overlayX = padding;
    const overlayY = canvas.height - 120;
    const overlayWidth = 300;
    const overlayHeight = 90;
    
    // Background with transparency
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
    
    // Border color based on confidence
    let borderColor = 'rgba(59, 130, 246, 0.9)'; // Default blue
    if (confidence >= 0.7) {
      borderColor = isAnimal ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'; // Red for animals, green for high confidence
    } else if (confidence >= 0.5) {
      borderColor = 'rgba(245, 158, 11, 0.9)'; // Yellow
    } else if (confidence > 0) {
      borderColor = 'rgba(239, 68, 68, 0.9)'; // Red
    }
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);
    
    // Draw label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(label, overlayX + 12, overlayY + 28);
    
    // Draw confidence percentage
    ctx.font = '16px Arial';
    ctx.fillText(`Confidence: ${(confidence * 100).toFixed(1)}%`, overlayX + 12, overlayY + 52);
    
    // Draw confidence level badge (High/Medium/Low) only if confidence > 0
    if (confidence > 0) {
      const confidenceLevel = confidence >= 0.85 ? 'High' : confidence >= 0.70 ? 'Medium' : 'Low';
      const badgeColor = confidence >= 0.85 ? '#10b981' : confidence >= 0.70 ? '#f59e0b' : '#ef4444';
      
      ctx.fillStyle = badgeColor;
      ctx.fillRect(overlayX + overlayWidth - 80, overlayY + 12, 65, 25);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(confidenceLevel, overlayX + overlayWidth - 47.5, overlayY + 29);
      ctx.textAlign = 'left';
    }
    
    // Draw confidence bar at the bottom
    const barX = overlayX + 12;
    const barY = overlayY + overlayHeight - 20;
    const barWidth = overlayWidth - 24;
    const barHeight = 8;
    
    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Confidence bar (only if confidence > 0)
    if (confidence > 0) {
      ctx.fillStyle = confidence >= 0.7 ? '#10b981' : confidence >= 0.5 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(barX, barY, barWidth * confidence, barHeight);
    }
  };

  const postDetection = async (detection: Detection) => {
    try {
      // Normalize label - capitalize first letter
      let normalizedLabel = detection.label;
      if (normalizedLabel) {
        normalizedLabel = normalizedLabel.charAt(0).toUpperCase() + normalizedLabel.slice(1).toLowerCase();
      }

      const detectionData = {
        label: normalizedLabel,
        probability: detection.confidence,
        confidence: detection.confidence * 100,
        source: 'esp32', // Use enum value from detection model
        detectedAt: detection.timestamp
      };

      console.log('📤 Posting detection to backend:', detectionData);

      const response = await apiFetch('/api/detections', {
        method: 'POST',
        body: detectionData
      });

      console.log('✅ Detection posted successfully:', response);
      
      // Show browser notification immediately (don't wait for permission check)
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification(`🚨 Animal Detected: ${normalizedLabel}`, {
              body: `${normalizedLabel} detected with ${(detection.confidence * 100).toFixed(1)}% confidence via ESP32 camera`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `detection-${Date.now()}`, // Prevent duplicate notifications
              requireInteraction: false
            });
            console.log('✅ Browser notification sent');
          } catch (notifError) {
            console.error('Failed to show browser notification:', notifError);
          }
        } else if (Notification.permission === 'default') {
          // Request permission if not yet asked
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`🚨 Animal Detected: ${normalizedLabel}`, {
                body: `${normalizedLabel} detected with ${(detection.confidence * 100).toFixed(1)}% confidence via ESP32 camera`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `detection-${Date.now()}`
              });
            }
          });
        }
      }
      
      // Update unread notification count
      fetchUnreadNotifications();
      
    } catch (err: any) {
      console.error('❌ Failed to post detection:', err);
      console.error('Error details:', err.message, err.response?.data);
      // Still show browser notification even if backend save fails
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🚨 Animal Detected: ${detection.label}`, {
            body: `Detection may not be saved. Check console for errors.`,
            icon: '/favicon.ico'
          });
        } catch (notifError) {
          console.error('Failed to show error notification:', notifError);
        }
      }
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600 bg-green-100';
    if (confidence >= 0.70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Cleanup detection on unmount or camera stop
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDevices();
  }, []);

  const statsCards = [
    {
      label: 'Total Managers',
      value: stats.users.managers.toString(),
      icon: UsersIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Active Cameras',
      value: stats.properties.totalCameras.toString(),
      icon: CameraIcon,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      label: 'Total Properties',
      value: stats.properties.total.toString(),
      icon: ChartBarIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'Detections Today',
      value: stats.detections.today.toString(),
      icon: ShieldCheckIcon,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const recentActivity = [
    { time: '2 min ago', event: 'Deer detected at Property A', status: 'Deterrent activated' },
    { time: '15 min ago', event: 'Squirrel detected at Property B', status: 'Warning sound played' },
    { time: '1 hour ago', event: 'Raccoon detected at Property C', status: 'Light deterrent activated' },
    { time: '3 hours ago', event: 'System maintenance completed', status: 'All systems operational' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>

                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => navigate('/admin/notifications')}
                      className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <BellIcon className="h-6 w-6" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                      )}
                    </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                  <p className="text-emerald-100 text-lg">Here's what's happening with your SADS system today</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm text-emerald-100">System Status</p>
                    <p className="text-2xl font-bold">All Systems Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* System Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">All Systems Online</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Camera Network</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Online</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">AI Detection</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Detection System</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">Ready</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Notifications</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">Configured</span>
                </div>
              </div>
            </div>

            {/* Live Camera Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Live Camera Feed</h2>
                <div className="flex items-center space-x-3">
                  {/* Device Selector for ESP32 - Show if devices exist */}
                  {devices.filter(d => d.type === 'camera' && d.serialNumber && d.serialNumber.startsWith('ESP32')).length > 0 && (
                    <select
                      value={selectedDevice?._id || ''}
                      onChange={(e) => {
                        const device = devices.find(d => d._id === e.target.value);
                        setSelectedDevice(device || null);
                        if (device) {
                          setCameraEnabled(true);
                        }
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select ESP32 Camera</option>
                      {devices
                        .filter(d => d.type === 'camera' && d.serialNumber && d.serialNumber.startsWith('ESP32'))
                        .map(device => (
                          <option key={device._id} value={device._id}>
                            {device.serialNumber} ({device.status === 'online' ? 'Online' : 'Offline'})
                          </option>
                        ))}
                    </select>
                  )}
                  
                  {/* Live Status Indicator - Only show when camera is on */}
                  {cameraEnabled && selectedDevice && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live</span>
                    </div>
                  )}
                  
                  {/* YOLO Status Indicator */}
                  {isDetecting && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${yoloAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${yoloAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        YOLO {yoloAvailable ? 'Ready' : 'Unavailable'}
                      </span>
                    </div>
                  )}
                  {/* YOLO Warning Banner */}
                  {!yoloAvailable && (
                    <div className="absolute top-20 left-0 right-0 mx-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-50">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-900">YOLO API Not Running</p>
                          <p className="text-xs text-yellow-800 mt-1">Detection requires the YOLO service. Run: <code className="bg-yellow-100 px-1 rounded">start_yolo_api.bat</code> or <code className="bg-yellow-100 px-1 rounded">cd ml && python yolo_api.py</code></p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Start/Stop Detection Button */}
                  {cameraEnabled && selectedDevice && (
                    <button
                      onClick={() => {
                        if (isDetecting) {
                          stopDetection();
                        } else {
                          startDetection();
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        isDetecting 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isDetecting ? (
                        <>
                          <StopCircleIcon className="h-4 w-4" />
                          <span>Stop Detection</span>
                        </>
                      ) : (
                        <>
                          <PlayCircleIcon className="h-4 w-4" />
                          <span>Start Detection</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Refresh Stream Button */}
                  {cameraEnabled && selectedDevice && (
                    <button
                      onClick={() => {
                        if (streamImgRef.current) {
                          console.log('🔄 Manually refreshing stream...');
                          // Force refresh by temporarily clearing and resetting src
                          const streamUrl = getEsp32StreamUrl(selectedDevice);
                          if (streamUrl) {
                            streamImgRef.current.src = '';
                            // Small delay to ensure browser clears the old connection
                            setTimeout(() => {
                              if (streamImgRef.current) {
                                streamImgRef.current.src = streamUrl;
                                console.log('✅ Stream URL refreshed:', streamUrl);
                              }
                            }, 100);
                          }
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center space-x-1"
                      title="Refresh stream connection"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  )}
                  
                  {/* Start/Stop Camera Button */}
                  <button
                    onClick={() => {
                      if (!selectedDevice) {
                        // Auto-create fallback device if none exists
                        const fallbackDevice: Device = {
                          _id: 'fallback-esp32',
                          serialNumber: 'ESP32-CAM-001',
                          type: 'camera',
                          status: 'offline',
                          assignedProperty: 'Default Property',
                          metadata: {
                            ipAddress: '10.82.225.44',
                            streamUrl: 'http://10.82.225.44/stream'
                          }
                        };
                        setSelectedDevice(fallbackDevice);
                        setCameraEnabled(true);
                        console.log('Auto-created fallback device and started camera');
                      } else {
                        // Toggle camera on/off
                        if (cameraEnabled) {
                          // Stop camera
                          if (isDetecting) {
                            stopDetection();
                          }
                          setCameraEnabled(false);
                          console.log('🛑 Camera stopped');
                        } else {
                          // Start camera
                          setCameraEnabled(true);
                          console.log('▶️ Camera started');
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cameraEnabled 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {cameraEnabled ? 'Stop Camera' : 'Start Camera'}
                  </button>
                </div>
              </div>
              <div className="relative" style={{ aspectRatio: '4/3', minHeight: '400px' }}>
                {cameraEnabled && selectedDevice ? (
                  <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                    {/* Loading indicator - auto-hide when stream loads */}
                    <div 
                      id={`stream-loading-${selectedDevice._id}`} 
                      className="absolute inset-0 flex items-center justify-center bg-gray-900 z-30 transition-opacity duration-300"
                      style={{ display: 'flex' }}
                    >
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-sm">Loading stream...</p>
                        <p className="text-xs text-gray-400 mt-2 break-all px-4">{getEsp32StreamUrl(selectedDevice) || 'No URL'}</p>
                      </div>
                    </div>
                    {/* Fallback: Use iframe for MJPEG stream (more reliable for some browsers) */}
                    <iframe
                      key={`iframe-fallback-${selectedDevice._id}-${cameraEnabled}`}
                      src={cameraEnabled ? (getEsp32StreamUrl(selectedDevice) || '') : ''}
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ 
                        backgroundColor: '#000',
                        zIndex: 0,
                        display: cameraEnabled ? 'block' : 'none',
                        border: 'none'
                      }}
                      title={`ESP32 Camera Stream ${selectedDevice.serialNumber}`}
                      allow="camera"
                    />
                    {/* Primary: Use img tag for MJPEG stream (better browser support) */}
                    <img
                      ref={streamImgRef}
                      key={`img-primary-${selectedDevice._id}-${cameraEnabled}`}
                      src={cameraEnabled ? (getEsp32StreamUrl(selectedDevice) || '') : ''}
                      alt={`ESP32 Camera ${selectedDevice.serialNumber}`}
                      className="absolute inset-0 w-full h-full object-contain"
                      crossOrigin="anonymous"
                      style={{ 
                        backgroundColor: '#000',
                        zIndex: 1,
                        imageRendering: 'auto',
                        display: cameraEnabled ? 'block' : 'none',
                        opacity: cameraEnabled ? 1 : 0
                      }}
                      loading="eager"
                      onLoadStart={() => {
                        console.log('🔄 Stream loading started...');
                        const streamUrl = getEsp32StreamUrl(selectedDevice);
                        console.log('📹 Stream URL:', streamUrl);
                        console.log('📹 Full img src:', streamImgRef.current?.src);
                      }}
                      onAbort={() => {
                        console.warn('⚠️ Stream loading aborted');
                        const streamUrl = getEsp32StreamUrl(selectedDevice);
                        console.warn('📹 Stream URL that was aborted:', streamUrl);
                      }}
                      onStalled={() => {
                        console.warn('⚠️ Stream loading stalled');
                        const streamUrl = getEsp32StreamUrl(selectedDevice);
                        console.warn('📹 Stream URL that stalled:', streamUrl);
                      }}
                      onSuspend={() => {
                        console.warn('⚠️ Stream loading suspended');
                        const streamUrl = getEsp32StreamUrl(selectedDevice);
                        console.warn('📹 Stream URL that was suspended:', streamUrl);
                      }}
                      onLoad={(e) => {
                        const target = e.currentTarget;
                        const streamUrl = getEsp32StreamUrl(selectedDevice);
                        console.log('✅ Image stream loaded successfully');
                        console.log('📹 Stream URL:', streamUrl);
                        console.log('📹 Image dimensions:', target.naturalWidth, 'x', target.naturalHeight);
                        console.log('📹 Image complete:', target.complete);
                        console.log('📹 Image naturalWidth:', target.naturalWidth);
                        console.log('📹 Image naturalHeight:', target.naturalHeight);
                        
                        // Hide loading indicator
                        const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
                        if (loadingDiv) {
                          loadingDiv.style.display = 'none';
                        }
                        
                        // Size canvas to match image (only if we have valid dimensions)
                        if (canvasRef.current && target.naturalWidth > 0 && target.naturalHeight > 0) {
                          canvasRef.current.width = target.naturalWidth;
                          canvasRef.current.height = target.naturalHeight;
                          console.log('✅ Canvas sized to match image:', canvasRef.current.width, 'x', canvasRef.current.height);
                          
                          // Redraw detection overlay if there's a current detection
                          if (currentDetection && currentDetection.confidence > 0) {
                            drawDetectionResult(currentDetection.label, currentDetection.confidence);
                          }
                        } else {
                          console.warn('⚠️ Image dimensions not available yet, will retry...');
                          // Retry canvas sizing after a short delay
                          setTimeout(() => {
                            if (canvasRef.current && target.naturalWidth > 0 && target.naturalHeight > 0) {
                              canvasRef.current.width = target.naturalWidth;
                              canvasRef.current.height = target.naturalHeight;
                              console.log('✅ Canvas sized after retry:', canvasRef.current.width, 'x', canvasRef.current.height);
                            }
                          }, 500);
                        }
                        
                        // Remove any error messages on successful load
                        const errorDiv = document.querySelector('.stream-error');
                        if (errorDiv) {
                          errorDiv.remove();
                        }
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const currentUrl = target.src;
                        const directUrl = getEsp32StreamUrl(selectedDevice);
                        const proxyUrl = getEsp32StreamUrl(selectedDevice, false, true);
                        
                        console.error('❌ Image stream failed to load ESP32 stream');
                        console.error('   Attempted URL:', currentUrl);
                        console.error('   Direct ESP32 URL:', directUrl);
                        console.error('   Proxy URL (fallback):', proxyUrl);
                        console.error('   Device:', selectedDevice);
                        console.error('   Image complete:', target.complete);
                        console.error('   Image naturalWidth:', target.naturalWidth);
                        console.error('   Image naturalHeight:', target.naturalHeight);
                        
                        // Try proxy URL as fallback if direct URL failed
                        if (!currentUrl.includes('/api/stream/proxy')) {
                          console.log('🔄 Direct URL failed, trying proxy as fallback...');
                          setTimeout(() => {
                            if (streamImgRef.current && !streamImgRef.current.complete) {
                              streamImgRef.current.src = proxyUrl;
                              console.log('   ✅ Switched to proxy URL:', proxyUrl);
                            }
                          }, 2000); // Wait 2 seconds before fallback
                        }
                        
                        // Diagnostic steps
                        console.error('🔍 Diagnostic steps:');
                        console.error('   1. Test direct URL:', directUrl);
                        console.error('   2. Test proxy URL:', proxyUrl);
                        console.error('   3. Check ESP32 Serial Monitor for connection status');
                        console.error('   4. Verify ESP32 IP address: 10.82.225.44');
                        console.error('   5. Ensure ESP32 and computer are on same network');
                        
                        // Hide loading indicator
                        const loadingDiv = document.getElementById(`stream-loading-${selectedDevice._id}`);
                        if (loadingDiv) {
                          loadingDiv.style.display = 'none';
                        }
                        
                        // Remove any existing error div
                        const existingError = target.parentElement?.querySelector('.stream-error');
                        if (existingError) existingError.remove();
                        
                        // Create error message with retry functionality
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'stream-error absolute inset-0 flex items-center justify-center bg-gray-800 text-white z-10';
                        errorDiv.innerHTML = `
                          <div class="text-center p-4 max-w-md">
                            <p class="text-red-400 mb-3 font-semibold text-lg">Stream Connection Error</p>
                            <p class="text-xs text-gray-400 mb-2">Cannot connect to ${selectedDevice.serialNumber}</p>
                            <p class="text-xs text-gray-500 mb-1 break-all">Proxy URL: ${proxyUrl || 'N/A'}</p>
                            <p class="text-xs text-gray-500 mb-1 break-all">Direct URL: ${directUrl || 'N/A'}</p>
                            <div class="mt-4 space-y-2">
                              <p class="text-xs text-yellow-400 font-semibold">Troubleshooting Steps:</p>
                              <ol class="text-xs text-gray-400 text-left list-decimal list-inside space-y-1">
                                <li>Verify ESP32 is powered on and connected to WiFi</li>
                                <li>Test direct stream: <a href="${directUrl}" target="_blank" class="text-blue-400 underline hover:text-blue-300">Open Direct URL</a></li>
                                <li>Test proxy stream: <a href="${proxyUrl}" target="_blank" class="text-blue-400 underline hover:text-blue-300">Open Proxy URL</a></li>
                                <li>Check IP address: ${selectedDevice.metadata?.ipAddress || '10.82.225.44'}</li>
                                <li>Ensure ESP32 and computer are on same network</li>
                              </ol>






























































































                              </div>
                            <div class="mt-4 space-y-3">
                              <div class="bg-gray-700 p-3 rounded">
                                <p class="text-xs text-yellow-300 font-semibold mb-2">IP Address Changed?</p>
                                <div class="flex gap-2">
                                  <input 
                                    type="text" 
                                    id="new-ip-input"
                                    placeholder="New IP (e.g., 10.82.225.44)"
                                    value="${selectedDevice.metadata?.ipAddress || '10.82.225.44'}"
                                    class="flex-1 px-2 py-1 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                                  />
                                  <button 
                                    id="update-ip-btn"
                                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs transition-colors"
                                  >
                                    Update IP
                                  </button>
                                </div>
                              </div>
                              <div class="flex gap-2 justify-center">
                                <button 
                                  id="retry-stream-btn"
                                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                                >
                                  🔄 Retry Connection
                                </button>
                                <button 
                                  onclick="window.location.reload()" 
                                  class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm transition-colors"
                                >
                                  🔃 Refresh Page
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                        target.parentElement?.appendChild(errorDiv);
                        
                        // Add retry button functionality
                        const retryBtn = errorDiv.querySelector('#retry-stream-btn');
                        if (retryBtn) {
                          retryBtn.addEventListener('click', () => {
                            console.log('🔄 Manual retry triggered');
                            errorDiv.remove();
                            // Force refresh by adding timestamp
                            target.src = getEsp32StreamUrl(selectedDevice, true) || '';
                          });
                        }
                        
                        // Add IP update functionality
                        const updateIpBtn = errorDiv.querySelector('#update-ip-btn') as HTMLButtonElement;
                        const ipInput = errorDiv.querySelector('#new-ip-input') as HTMLInputElement;
                        if (updateIpBtn && ipInput && selectedDevice) {
                          updateIpBtn.addEventListener('click', async () => {
                            const newIp = ipInput.value.trim();
                            if (!newIp) {
                              alert('Please enter an IP address');
                              return;
                            }
                            
                            // Validate IP format
                            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
                            if (!ipRegex.test(newIp)) {
                              alert('Invalid IP address format. Use format: 192.168.1.100');
                              return;
                            }
                            
                            try {
                              console.log(`📡 Updating IP for ${selectedDevice.serialNumber} to ${newIp}`);
                              updateIpBtn.textContent = 'Updating...';
                              updateIpBtn.disabled = true;
                              
                              const response = await apiFetch(`/api/devices/${selectedDevice._id}/ip`, {
                                method: 'PATCH',
                                body: { ipAddress: newIp }
                              });
                              
                              console.log('✅ IP updated successfully:', response.data);
                              
                              // Update device in state
                              setSelectedDevice({
                                ...selectedDevice,
                                metadata: {
                                  ...selectedDevice.metadata,
                                  ipAddress: newIp,
                                  streamUrl: `http://${newIp}/stream`
                                }
                              });
                              
                              // Refresh devices list
                              await fetchDevices();
                              
                              // Retry connection with new IP
                              errorDiv.remove();
                              target.src = `http://${newIp}/stream`;
                              
                              alert(`✅ IP address updated to ${newIp}. Stream should connect now.`);
                            } catch (err: any) {
                              console.error('❌ Failed to update IP:', err);
                              alert(`Failed to update IP: ${err.message || 'Unknown error'}`);
                              updateIpBtn.textContent = 'Update IP';
                              updateIpBtn.disabled = false;
                            }
                          });
                        }
                        
                        // Auto-retry after 3 seconds (less aggressive)
                        const retryTimeout = setTimeout(() => {
                          if (target.parentElement?.querySelector('.stream-error')) {
                            console.log('🔄 Auto-retrying stream connection...');
                            errorDiv.remove();
                            target.src = getEsp32StreamUrl(selectedDevice, true) || '';
                          }
                        }, 3000);
                        
                        // Clear timeout if error div is removed
                        const observer = new MutationObserver(() => {
                          if (!target.parentElement?.querySelector('.stream-error')) {
                            clearTimeout(retryTimeout);
                            observer.disconnect();
                          }
                        });
                        observer.observe(target.parentElement || document.body, { childList: true, subtree: true });
                      }}
                    />
                    {/* Canvas for detection overlay */}
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                    />
                    {/* Detection Result Overlay - Enhanced with confidence display */}
                    {isDetecting && (
                      <div 
                        className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg z-20 border-2 shadow-lg" 
                        style={{ 
                          minWidth: '280px',
                          borderColor: currentDetection ? (
                            currentDetection.confidence >= 0.85 ? '#10b981' :
                            currentDetection.confidence >= 0.70 ? '#f59e0b' :
                            currentDetection.confidence > 0 ? '#ef4444' : '#6b7280'
                          ) : '#6b7280'
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-lg">
                              {currentDetection ? currentDetection.label : 'Analyzing...'}
                            </p>
                            {currentDetection && currentDetection.confidence > 0 && (
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                currentDetection.confidence >= 0.85 ? 'bg-green-500 text-white' :
                                currentDetection.confidence >= 0.70 ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {currentDetection.confidence >= 0.85 ? 'High' : currentDetection.confidence >= 0.70 ? 'Medium' : 'Low'}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Confidence: <span className={`font-bold ${
                                currentDetection && currentDetection.confidence > 0 ? (
                                  currentDetection.confidence >= 0.7 ? 'text-green-300' :
                                  currentDetection.confidence >= 0.5 ? 'text-yellow-300' :
                                  'text-red-300'
                                ) : 'text-gray-400'
                              }`}>
                                {currentDetection && currentDetection.confidence > 0 
                                  ? `${(currentDetection.confidence * 100).toFixed(1)}%`
                                  : '0.0%'}
                              </span>
                            </p>
                            {/* Confidence bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  currentDetection && currentDetection.confidence > 0 ? (
                                    currentDetection.confidence >= 0.7 ? 'bg-green-500' :
                                    currentDetection.confidence >= 0.5 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  ) : 'bg-gray-500'
                                }`}
                                style={{ width: `${currentDetection && currentDetection.confidence > 0 ? currentDetection.confidence * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Overlay Info */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-20">
                      {selectedDevice.serialNumber}
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 font-medium z-20">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                    {isDetecting && (
                      <div className="absolute top-2 right-24 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 font-medium z-20">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>DETECTING</span>
                      </div>
                    )}
                    {currentDetection && isDetecting && (
                      <div className={`absolute top-2 right-40 px-2 py-1 rounded text-xs font-medium z-20 ${
                        currentDetection.confidence >= 0.85 ? 'bg-green-500 text-white' :
                        currentDetection.confidence >= 0.70 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        <span className="font-bold">{(currentDetection.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {!selectedDevice ? 'Click "Start Camera" to view ESP32 feed' : 'Click "Start Camera" to view stream'}
                      </p>
                      {selectedDevice && (
                        <p className="text-xs text-gray-400 mt-1">{selectedDevice.serialNumber}</p>
                      )}
                      {devices.filter(d => d.type === 'camera' && d.serialNumber.startsWith('ESP32')).length === 0 && (
                        <p className="text-xs text-gray-400 mt-2">No ESP32 cameras registered. Register a device first.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Detection Stats and Recent Detections */}
              {cameraEnabled && selectedDevice && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Detection Stats */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Detections</p>
                        <p className="text-2xl font-bold text-blue-600">{detectionStats.totalDetections}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">High Confidence</p>
                        <p className="text-2xl font-bold text-green-600">{detectionStats.highConfidence}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Elephants</p>
                        <p className="text-2xl font-bold text-purple-600">{detectionStats.elephantCount}</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Tigers</p>
                        <p className="text-2xl font-bold text-red-600">{detectionStats.tigerCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Detections */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Detections</h3>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {recentDetections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No detections yet</p>
                          <p className="text-xs mt-1">Start detection to see results</p>
                        </div>
                      ) : (
                        recentDetections.map((detection, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900">{detection.label}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(detection.confidence)}`}>
                                {(detection.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(detection.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                    <div className="flex-shrink-0 w-3 h-3 bg-emerald-500 rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                      <p className="text-sm text-emerald-600 font-medium">{activity.status}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/admin/manager-profiles')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all duration-200 hover:scale-105 border border-purple-200"
                >
                  <UsersIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">Manager Profiles</span>
                    <span className="text-xs text-purple-600">Manage accounts & analytics</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/detection-report')}
                  className="flex items-center space-x-3 p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-all duration-200 hover:scale-105 border border-orange-200"
                >
                  <ChartBarIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">View Reports</span>
                    <span className="text-xs text-orange-600">Analytics & insights</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="flex items-center space-x-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all duration-200 hover:scale-105 border border-emerald-200"
                >
                  <BellIcon className="h-6 w-6" />
                  <div className="text-left">
                    <span className="font-medium block">Notifications</span>
                    <span className="text-xs text-emerald-600">System alerts</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;