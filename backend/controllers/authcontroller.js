const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { googleClientId, jwtSecret, adminEmails } = require('../config/constants');
const User = require('../models/user');

const googleClient = new OAuth2Client(googleClientId);

function generateJwt(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

exports.getGoogleClientId = (req, res) => {
  if (!googleClientId) {
    return res.status(500).json({ message: 'Google client ID not configured' });
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
      const role = adminEmails.includes(email) ? 'admin' : 'manager';
      user = new User({ 
        name, 
        email, 
        avatar: picture, 
        googleId, 
        lastLogin: new Date(), 
        role,
        plantation: role === 'manager' ? { name: 'Unassigned Plantation' } : undefined
      });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
      }
      if (!user.role) {
        user.role = adminEmails.includes(email) ? 'admin' : 'manager';
        if (user.role === 'manager' && !user.plantation) {
          user.plantation = { name: 'Unassigned Plantation' };
        }
      }
      user.lastLogin = new Date();
      await user.save();
    }
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (err) {
    console.error('Google sign-in error', err);
    return res.status(401).json({ message: 'Google token verification failed' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const token = generateJwt({ userId: user._id, email: user.email, role: user.role });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to get profile' });
  }
};



