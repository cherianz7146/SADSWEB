/**
 * Dependency Check Script
 * Ensures all required Node.js modules are installed before starting the server
 * Run this before starting the server to prevent "Cannot find module" errors
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');
// Check for workspace setup (dependencies in root node_modules)
const rootNodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Check if node_modules exists (local or root for workspaces)
const hasLocalNodeModules = fs.existsSync(nodeModulesPath);
const hasRootNodeModules = fs.existsSync(rootNodeModulesPath);

if (!hasLocalNodeModules && !hasRootNodeModules) {
  console.error('❌ node_modules directory not found!');
  console.error('   Please run: npm install (from project root)');
  process.exit(1);
}

// Determine which node_modules to check (prefer local, fallback to root for workspaces)
const checkNodeModulesPath = hasLocalNodeModules ? nodeModulesPath : rootNodeModulesPath;
const isUsingWorkspace = !hasLocalNodeModules && hasRootNodeModules;

if (isUsingWorkspace) {
  console.log('ℹ️  Using workspace setup - checking root node_modules');
}

// Check critical dependencies
const criticalDeps = [
  'express',
  'express-async-handler',
  'mongoose',
  'dotenv',
  'cors'
];

const missingDeps = [];

for (const dep of criticalDeps) {
  const depPath = path.join(checkNodeModulesPath, dep);
  if (!fs.existsSync(depPath)) {
    // Also try to require it (Node.js might resolve it differently)
    try {
      require.resolve(dep);
      // Module can be resolved, so it's available
      continue;
    } catch (e) {
      missingDeps.push(dep);
    }
  }
}

if (missingDeps.length > 0) {
  console.error('❌ Missing critical dependencies:');
  missingDeps.forEach(dep => console.error(`   - ${dep}`));
  console.error('\n   Please run: npm install');
  process.exit(1);
}

console.log('✅ All dependencies are installed');
process.exit(0);
