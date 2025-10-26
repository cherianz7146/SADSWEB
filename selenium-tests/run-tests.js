const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runTests(browser = 'chrome') {
  try {
    console.log(`Running Selenium tests in ${browser}...`);
    
    // Run tests
    const { stdout, stderr } = await execAsync(`npm run test:${browser}`, { 
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    if (stderr) {
      console.error('Test errors:', stderr);
    }
    
    console.log('Test output:');
    console.log(stdout);
  } catch (error) {
    console.error('Tests failed:', error.message);
    if (error.stdout) {
      console.log('Test output:');
      console.log(error.stdout);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const browser = process.argv[2] || 'chrome';
  runTests(browser);
}

module.exports = { runTests };