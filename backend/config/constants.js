require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  // Support multiple comma-separated origins. Example:
  // CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173"
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : ['http://localhost:5173'],
  jwtSecret: process.env.JWT_SECRET || 'change-me-dev-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean),
};

module.exports = config;



