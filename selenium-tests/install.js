const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function installDependencies() {
  try {
    console.log('Installing Selenium test dependencies...');
    
    // Install npm dependencies
    const { stdout, stderr } = await execAsync('npm install', { cwd: __dirname });
    
    if (stderr) {
      console.error('Error during installation:', stderr);
    } else {
      console.log('Installation completed successfully!');
      console.log(stdout);
    }
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
  }
}

// Run installation if this script is executed directly
if (require.main === module) {
  installDependencies();
}

module.exports = { installDependencies };