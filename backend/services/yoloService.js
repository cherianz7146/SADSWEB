/**
 * YOLO API Service Manager
 * Automatically starts and manages the YOLO API process
 */

const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

const YOLO_API_URL = process.env.YOLO_API_URL || 'http://localhost:5001';
const YOLO_API_PATH = path.join(__dirname, '../../ml/yolo_api.py');
const AUTO_START_YOLO = process.env.AUTO_START_YOLO !== 'false'; // Enable by default

let yoloProcess = null;
let isStarting = false;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_DELAY = 5000; // 5 seconds

/**
 * Check if YOLO API is running
 */
async function checkYoloHealth() {
  try {
    const response = await axios.get(`${YOLO_API_URL}/health`, { 
      timeout: 5000, // Increased timeout for model loading
      validateStatus: () => true // Don't throw on any status
    });
    return response.status === 200 && response.data.status === 'ok' && response.data.model_loaded === true;
  } catch (error) {
    return false;
  }
}

/**
 * Start YOLO API process
 */
function startYoloAPI() {
  if (yoloProcess && !yoloProcess.killed) {
    console.log('✅ YOLO API process already running');
    return;
  }

  if (isStarting) {
    console.log('⏳ YOLO API is already starting...');
    return;
  }

  if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
    console.error(`❌ YOLO API failed to start after ${MAX_RESTART_ATTEMPTS} attempts. Please start manually.`);
    return;
  }

  isStarting = true;
  restartAttempts++;

  console.log(`🤖 Starting YOLO API service (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
  console.log(`   Path: ${YOLO_API_PATH}`);

  // Determine Python command (python or python3)
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  console.log(`   Python: ${pythonCmd}`);
  console.log(`   Working directory: ${path.join(__dirname, '../../ml')}`);

  // Start YOLO API process
  // Use shell: true on Windows for better compatibility
  // Try to use virtual environment Python if available
  let finalPythonCmd = pythonCmd;
  const venvPython = path.join(__dirname, '../../ml/.venv/Scripts/python.exe');
  if (process.platform === 'win32' && require('fs').existsSync(venvPython)) {
    console.log(`   Using virtual environment Python: ${venvPython}`);
    finalPythonCmd = venvPython;
  }
  
  yoloProcess = spawn(finalPythonCmd, [YOLO_API_PATH], {
    cwd: path.join(__dirname, '../../ml'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32' // Use shell on Windows for better Python path resolution
  });

  // Handle stdout
  yoloProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[YOLO API] ${output}`);
    }
  });

  // Handle stderr
  yoloProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('INFO:') && !output.includes('WARNING:')) {
      console.error(`[YOLO API Error] ${output}`);
    }
  });

  // Handle process exit
  yoloProcess.on('exit', (code, signal) => {
    console.log(`[YOLO API] Process exited with code ${code}, signal ${signal}`);
    yoloProcess = null;
    isStarting = false;

    // Auto-restart if it crashed (not manually stopped)
    if (code !== 0 && code !== null && AUTO_START_YOLO) {
      console.log(`🔄 YOLO API crashed. Restarting in ${RESTART_DELAY / 1000} seconds...`);
      setTimeout(() => {
        if (restartAttempts < MAX_RESTART_ATTEMPTS) {
          startYoloAPI();
        }
      }, RESTART_DELAY);
    } else if (code === 0) {
      // Successfully stopped, reset restart attempts
      restartAttempts = 0;
    }
  });

  // Handle process error
  yoloProcess.on('error', (error) => {
    console.error(`❌ Failed to start YOLO API: ${error.message}`);
    console.error(`   Make sure Python is installed and YOLO dependencies are available.`);
    console.error(`   Run: cd ml && pip install flask flask-cors ultralytics opencv-python`);
    yoloProcess = null;
    isStarting = false;
  });

  // Wait and verify it started (YOLO model loading can take 10-30 seconds)
  // Retry health check multiple times with increasing delays
  const checkHealthWithRetry = async (attempt = 1, maxAttempts = 6) => {
    if (attempt > maxAttempts) {
      console.warn('⚠️ YOLO API process started but health check failed after multiple attempts.');
      console.warn('   YOLO may still be loading the model. It will be checked periodically.');
      isStarting = false;
      return;
    }

    const delay = attempt * 5000; // 5s, 10s, 15s, 20s, 25s, 30s
    setTimeout(async () => {
      const isHealthy = await checkYoloHealth();
      if (isHealthy) {
        console.log('✅ YOLO API started successfully and is healthy!');
        restartAttempts = 0; // Reset on success
        isStarting = false;
      } else {
        if (attempt < maxAttempts) {
          console.log(`⏳ YOLO API still initializing... (attempt ${attempt}/${maxAttempts})`);
          checkHealthWithRetry(attempt + 1, maxAttempts);
        } else {
          console.warn('⚠️ YOLO API process started but health check failed. It may still be loading the model.');
          console.warn('   The health check will continue periodically. YOLO should be ready soon.');
          isStarting = false;
        }
      }
    }, delay);
  };

  // Start health check retry sequence
  checkHealthWithRetry();
}

/**
 * Stop YOLO API process
 */
function stopYoloAPI() {
  if (yoloProcess && !yoloProcess.killed) {
    console.log('🛑 Stopping YOLO API service...');
    yoloProcess.kill('SIGTERM');
    yoloProcess = null;
    restartAttempts = 0;
  }
}

/**
 * Initialize YOLO service
 * Checks if YOLO is running, starts it if not
 */
async function initializeYoloService() {
  if (!AUTO_START_YOLO) {
    console.log('ℹ️  Auto-start YOLO API is disabled (AUTO_START_YOLO=false)');
    return;
  }

  console.log('🔍 Checking YOLO API status...');
  const isHealthy = await checkYoloHealth();

  if (isHealthy) {
    console.log('✅ YOLO API is already running and healthy!');
    console.log(`   URL: ${YOLO_API_URL}`);
    return;
  }

  console.log('⚠️  YOLO API is not running. Starting automatically...');
  console.log(`   This will start YOLO API at: ${YOLO_API_URL}`);
  startYoloAPI();
}

/**
 * Periodic health check and auto-restart
 */
let healthCheckInterval = null;

function startHealthCheck() {
  if (healthCheckInterval) {
    return; // Already running
  }

  // Check every 30 seconds
  healthCheckInterval = setInterval(async () => {
    if (!AUTO_START_YOLO) {
      return;
    }

    const isHealthy = await checkYoloHealth();
    
    if (!isHealthy && !isStarting) {
      console.log('⚠️  YOLO API health check failed. Attempting to restart...');
      if (yoloProcess && !yoloProcess.killed) {
        yoloProcess.kill('SIGTERM');
      }
      restartAttempts = 0; // Reset attempts for health check restart
      setTimeout(() => startYoloAPI(), 2000);
    }
  }, 30000); // Check every 30 seconds
}

function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, stopping YOLO API...');
  stopYoloAPI();
  stopHealthCheck();
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, stopping YOLO API...');
  stopYoloAPI();
  stopHealthCheck();
});

module.exports = {
  initializeYoloService,
  startYoloAPI,
  stopYoloAPI,
  checkYoloHealth,
  startHealthCheck,
  stopHealthCheck
};

