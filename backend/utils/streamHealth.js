/**
 * Stream Health Monitor
 * Monitors ESP32 stream connectivity and provides diagnostics
 */

const axios = require('axios');

/**
 * Check if ESP32 stream is reachable
 */
async function checkStreamHealth(streamUrl, timeout = 5000) {
  try {
    const response = await axios.get(streamUrl, {
      timeout,
      validateStatus: () => true, // Accept any status for health check
      maxRedirects: 0
    });
    
    return {
      healthy: response.status === 200,
      status: response.status,
      reachable: true,
      contentType: response.headers['content-type'],
      error: null
    };
  } catch (error) {
    return {
      healthy: false,
      status: null,
      reachable: false,
      contentType: null,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
}

/**
 * Diagnose stream connection issues
 */
function diagnoseStreamIssue(healthResult, streamUrl) {
  const issues = [];
  const suggestions = [];
  
  if (!healthResult.reachable) {
    issues.push('ESP32 stream is not reachable');
    
    switch (healthResult.error?.code) {
      case 'ECONNREFUSED':
        suggestions.push('ESP32 may not be powered on');
        suggestions.push('ESP32 may not be running the stream server');
        suggestions.push('Check ESP32 Serial Monitor for errors');
        break;
      case 'ETIMEDOUT':
        suggestions.push('ESP32 is taking too long to respond');
        suggestions.push('Network may be congested');
        suggestions.push('ESP32 may be overloaded');
        break;
      case 'ENOTFOUND':
        suggestions.push('IP address may be incorrect');
        suggestions.push('ESP32 may have disconnected from WiFi');
        suggestions.push('Check if ESP32 IP address changed');
        break;
      case 'EHOSTUNREACH':
        suggestions.push('ESP32 and computer may be on different networks');
        suggestions.push('Check network connectivity');
        suggestions.push('Verify ESP32 is on the same WiFi network');
        break;
      default:
        suggestions.push('Unknown network error');
        suggestions.push('Check ESP32 Serial Monitor');
    }
  } else if (healthResult.status !== 200) {
    issues.push(`ESP32 returned status ${healthResult.status}`);
    suggestions.push('ESP32 stream endpoint may not be configured correctly');
    suggestions.push('Check ESP32 code for /stream route');
  }
  
  return {
    issues,
    suggestions,
    streamUrl
  };
}

module.exports = {
  checkStreamHealth,
  diagnoseStreamIssue
};
