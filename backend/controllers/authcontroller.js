const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { googleClientId, jwtSecret } = require('../config/constants');
const User = require('../models/user');

const googleClient = new OAuth2Client(googleClientId);

// Helper function to check MongoDB connection
function checkMongoConnection() {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state !== 1) {
    throw new Error(`Database not connected. Connection state: ${state === 0 ? 'disconnected' : state === 2 ? 'connecting' : 'disconnecting'}`);
  }
}

function generateJwt(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

exports.getGoogleClientId = (req, res) => {
  if (!googleClientId || googleClientId === 'your-google-client-id-here') {
    // Return null if not configured (allows app to work without Google OAuth)
    return res.json({ clientId: null });
  }
  return res.json({ clientId: googleClientId });
};

exports.verifyGoogleIdToken = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }
    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    const { email, name, picture, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({ message: 'Google token missing email' });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, avatar: picture, googleId, lastLogin: new Date() });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
      }
      user.lastLogin = new Date();
      await user.save();
    }
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        userId: user.userId, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      } 
    });
  } catch (err) {
    console.error('Google sign-in error', err);
    return res.status(401).json({ message: 'Google token verification failed', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, plantation, phone } = req.body;
    
    console.log('Registration request received:', { name, email, plantation });
    
    // Validate input
    if (!name || !email || !password) {
      console.log('Registration validation failed: missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Validate name length
    if (name.trim().length < 2) {
      console.log('Registration validation failed: name too short');
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Registration validation failed: invalid email format');
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    
    // Validate password length
    if (password.length < 6) {
      console.log('Registration validation failed: password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Registration failed: email already exists', email);
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Hash password and create user
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    
    // Validate phone if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ message: 'Invalid phone number format. Use E.164 format (e.g., +919876543210)' });
      }
    }

    // Prepare user data
    const userData = { 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashed 
    };
    
    // Add phone if provided
    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }
    
    // Add plantation information if provided
    if (plantation && plantation.trim()) {
      userData.plantation = {
        name: plantation.trim(),
        location: '', // Can be updated later
        fields: [],
        assignedBy: null
      };
    }
    
    // Set default alert preferences if phone is provided
    if (phone && phone.trim()) {
      userData.alertPreferences = {
        enableSMS: true,
        enableWhatsApp: true,
        enableCalls: true,
        criticalOnly: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      };
    }
    
    const user = await User.create(userData);
    console.log('User created successfully:', { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role, plantation: user.plantation?.name });
    
    // Create property if plantation is provided
    if (plantation && plantation.trim()) {
      const Property = require('../models/property');
      try {
        const property = await Property.create({
          name: plantation.trim(),
          managerId: user._id,  // Fixed: use managerId instead of owner
          address: user.plantation?.location || 'To be updated',  // Required field
          description: `Property for ${user.name}`,
          cameraCount: 0,
          status: 'active',
          plantation: {
            name: plantation.trim(),
            location: user.plantation?.location || '',
            fields: [],
            assignedBy: user._id
          }
        });
        console.log('Property created successfully for user:', { propertyId: property._id, name: property.name, userId: user._id, managerId: user._id });
      } catch (propError) {
        console.error('Failed to create property:', propError);
        console.error('Property error details:', propError.message);
        // Don't fail the registration if property creation fails
      }
    }
    
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    
    // Send welcome package (Email + SMS + WhatsApp)
    console.log('Sending welcome package to registered user:', { name: user.name, email: user.email, phone: user.phone });
    const { sendCompleteWelcome } = require('../services/welcomemessages');
    sendCompleteWelcome(user)
      .then((results) => {
        console.log('✅ Welcome package sent:', results);
        const channels = [];
        if (results.email.success) channels.push('Email');
        if (results.sms.success) channels.push('SMS');
        if (results.whatsapp.success) channels.push('WhatsApp');
        console.log(`📨 Welcome messages sent via: ${channels.join(', ') || 'None'}`);
      })
      .catch(err => console.error('❌ Failed to send welcome package:', err));
    
    return res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        userId: user.userId,  // Include userId in response
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      } 
    });
  } catch (e) {
    console.error('Registration error:', e);
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(err => err.message);
      return res.status(400).json({ message: 'Registration failed', details: messages });
    }
    return res.status(500).json({ message: 'Registration failed', error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Check MongoDB connection state
    const connectionState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (connectionState === 0) {
      // Truly disconnected - wait a bit and try to reconnect
      console.warn('⚠️  MongoDB disconnected during login, attempting to reconnect...');
      try {
        const { mongoUri } = require('../config/constants');
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000
        });
        console.log('✅ MongoDB reconnected');
      } catch (reconnectError) {
        console.error('❌ Failed to reconnect:', reconnectError.message);
        return res.status(503).json({ 
          message: 'Database connection unavailable',
          error: 'Unable to connect to database. Please check your internet connection and try again.',
          details: 'Database is disconnected and reconnection failed'
        });
      }
    }
    
    // If connecting (state 2), wait a moment for connection to establish
    if (connectionState === 2) {
      console.log('⏳ MongoDB is connecting, waiting...');
      let attempts = 0;
      while (mongoose.connection.readyState !== 1 && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
          message: 'Database connection unavailable',
          error: 'Database connection is taking longer than expected. Please try again in a moment.',
          details: 'Connection timeout'
        });
      }
    }
    
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    
    // Auto-create manager profile if user is a manager and profile doesn't exist
    if (user.role === 'manager') {
      try {
        const ManagerProfile = require('../models/managerProfile');
        const existingProfile = await ManagerProfile.findOne({ Manager_Id: user._id });
        if (!existingProfile) {
          const { calculateManagerStats } = require('../controllers/managerProfileController');
          const stats = await calculateManagerStats(user._id.toString());
          const newProfile = await ManagerProfile.create({
            Manager_Id: user._id,
            accountCreatedAt: user.createdAt,
            lastLoginAt: user.lastLogin,
            totalLoginCount: 1,
            ...stats
          });
          newProfile.calculatePerformanceScore();
          await newProfile.save();
          console.log(`✅ Auto-created manager profile for ${user.name} (${user.email})`);
        } else {
          // Update last login info
          existingProfile.lastLoginAt = user.lastLogin;
          existingProfile.totalLoginCount = (existingProfile.totalLoginCount || 0) + 1;
          existingProfile.lastActiveDate = new Date();
          await existingProfile.save();
        }
      } catch (profileError) {
        // Don't fail login if profile creation fails
        console.warn('Failed to create/update manager profile:', profileError.message);
      }
    }
    
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        userId: user.userId, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      } 
    });
  } catch (e) {
    console.error('Login error:', e);
    
    // Check if it's a MongoDB connection error
    if (e.name === 'MongooseError' || e.name === 'MongoServerError' || e.message.includes('buffering') || e.message.includes('timeout') || e.message.includes('connection')) {
      return res.status(503).json({ 
        message: 'Database connection unavailable',
        error: 'Unable to connect to database. Please check your internet connection and try again.',
        details: e.message
      });
    }
    
    return res.status(500).json({ message: 'Login failed', error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ 
      id: user._id, 
      userId: user.userId, 
      name: user.name, 
      email: user.email, 
      avatar: user.avatar, 
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    });
  } catch (e) {
    console.error('Profile fetch error:', e);
    return res.status(500).json({ message: 'Failed to get profile', error: e.message });
  }
};



