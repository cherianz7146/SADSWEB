/**
 * Stream Controller
 * Proxies MJPEG streams from ESP32 cameras to frontend
 */

const axios = require('axios');

/**
 * Proxy MJPEG stream from ESP32 camera
 * This allows the frontend to access ESP32 streams without CORS issues
 */
exports.proxyStream = async (req, res) => {
  let streamResponse = null;
  
  try {
    const { streamUrl } = req.query;

    if (!streamUrl) {
      return res.status(400).json({
        success: false,
        message: 'Stream URL is required'
      });
    }

    // Decode URL if encoded
    const decodedUrl = decodeURIComponent(streamUrl);
    console.log(`📹 Proxying stream from: ${decodedUrl}`);

    // Validate stream URL (security check)
    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stream URL format'
      });
    }

    // Set CORS headers before making the request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Fetch the MJPEG stream with increased timeout and retry logic
    // Retry up to 3 times with exponential backoff for better reliability
    let lastError = null;
    const maxRetries = 3;
    const retryDelays = [1000, 2000, 3000]; // 1s, 2s, 3s
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} for stream: ${decodedUrl}`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt - 1]));
        }
        
        streamResponse = await axios.get(decodedUrl, {
          responseType: 'stream',
          timeout: 30000, // Increased to 30 seconds for ESP32 streams (they can be slow to start)
          headers: {
            'Accept': 'multipart/x-mixed-replace, image/jpeg, image/*',
            'User-Agent': 'SADS-Stream-Proxy/1.0',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
          },
          validateStatus: (status) => status >= 200 && status < 400,
          maxRedirects: 0, // Don't follow redirects for streams
          // Add keep-alive for better connection management
          httpAgent: new (require('http').Agent)({ 
            keepAlive: true, 
            keepAliveMsecs: 30000,
            timeout: 30000, // Match axios timeout
            family: 4 // Force IPv4
          }),
          httpsAgent: new (require('https').Agent)({ 
            keepAlive: true, 
            keepAliveMsecs: 30000,
            timeout: 30000, // Match axios timeout
            family: 4 // Force IPv4
          })
        });
        
        // Success - break out of retry loop
        break;
      } catch (retryError) {
        lastError = retryError;
        console.warn(`⚠️ Stream connection attempt ${attempt + 1} failed: ${retryError.message}`);
        
        // Don't retry on certain errors (like 404)
        if (retryError.response && retryError.response.status === 404) {
          break; // No point retrying 404
        }
        
        // Continue to next retry attempt
        if (attempt < maxRetries - 1) {
          continue;
        }
      }
    }
    
    // If all retries failed, handle the error
    if (!streamResponse) {
      const axiosError = lastError;
      console.error('❌ Failed to connect to ESP32 stream after all retries:', axiosError.message);
      console.error('   Error code:', axiosError.code);
      console.error('   Stream URL:', decodedUrl);
      console.error('   Total attempts:', maxRetries);
      
      // Provide more specific error messages
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ENOTFOUND' || axiosError.code === 'EHOSTUNREACH') {
        return res.status(503).json({
          success: false,
          message: 'Cannot connect to camera stream',
          error: `Failed to connect to ${decodedUrl} after ${maxRetries} attempts. Ensure ESP32 is powered on and connected to WiFi.`,
          errorCode: axiosError.code,
          troubleshooting: [
            'Verify ESP32 is powered on and connected to WiFi',
            `Check IP address: ${decodedUrl.match(/http:\/\/([^\/]+)/)?.[1] || 'unknown'}`,
            'Ensure ESP32 and computer are on same network',
            'Check ESP32 Serial Monitor for connection status',
            'Try restarting ESP32',
            'Test stream directly in browser: ' + decodedUrl
          ]
        });
      }
      
      throw axiosError;
    }

    // Set headers for MJPEG stream
    res.setHeader('Content-Type', streamResponse.headers['content-type'] || 'multipart/x-mixed-replace; boundary=frame');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for real-time stream

    console.log('✅ Stream proxy connected, piping data to client...');
    console.log('   Content-Type:', streamResponse.headers['content-type']);

    // Pipe the stream to the response
    streamResponse.data.pipe(res);

    // Handle stream errors
    streamResponse.data.on('error', (error) => {
      console.error('❌ Stream data error:', error.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Stream proxy error',
          error: error.message
        });
      } else {
        // If headers already sent, just end the response
        res.end();
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log('📴 Client disconnected from stream proxy');
      if (streamResponse && streamResponse.data) {
        streamResponse.data.destroy();
      }
    });

    // Handle response close
    res.on('close', () => {
      console.log('📴 Response closed, cleaning up stream');
      if (streamResponse && streamResponse.data) {
        streamResponse.data.destroy();
      }
    });

  } catch (error) {
    console.error('❌ Stream proxy error:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (!res.headersSent) {
      // Check for various connection error codes
      const connectionErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNRESET'];
      if (error.code && connectionErrors.includes(error.code)) {
        return res.status(503).json({
          success: false,
          message: 'Cannot connect to camera stream',
          error: `Failed to connect to camera. Error: ${error.code}`,
          errorCode: error.code,
          troubleshooting: [
            'Verify ESP32 is powered on and connected to WiFi',
            'Check if ESP32 IP address is correct',
            'Ensure ESP32 and computer are on same network',
            'Try accessing the stream URL directly in browser'
          ]
        });
      }

      // Check if it's an axios error
      if (error.response) {
        return res.status(error.response.status || 500).json({
          success: false,
          message: 'Failed to proxy stream',
          error: error.message,
          status: error.response.status
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to proxy stream',
        error: error.message
      });
    } else {
      // Headers already sent, just end the response
      res.end();
    }
    
    // Clean up stream if it exists
    if (streamResponse && streamResponse.data) {
      streamResponse.data.destroy();
    }
  }
};

