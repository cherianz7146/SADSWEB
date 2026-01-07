require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS - Support multiple comma-separated origins
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : ['http://localhost:5173'],
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://sads:sads@cluster0.9iyvnte.mongodb.net/sads?retryWrites=true&w=majority&appName=Cluster0',
  
  // JWT Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || 'SADS System <no-reply@sads.local>',
  
  // Twilio (SMS/WhatsApp/Voice)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886',
  
  // Admin
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean),
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = config;



