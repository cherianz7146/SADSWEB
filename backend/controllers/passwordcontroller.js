const crypto = require('crypto');
const User = require('../models/user');
const { sendPasswordResetEmail } = require('../services/emailservices');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If the email exists, a reset link was sent' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    try { await sendPasswordResetEmail(user, resetUrl); } catch {}
    return res.json({ message: 'Reset link sent if email exists' });
  } catch (e) {
    console.error('Forgot password error:', e);
    return res.status(500).json({ message: 'Failed to process request', error: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ message: 'email, token, newPassword required' });
    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    const bcrypt = require('bcryptjs');
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  } catch (e) {
    console.error('Reset password error:', e);
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    return res.status(500).json({ message: 'Failed to reset password', error: e.message });
  }
};





























