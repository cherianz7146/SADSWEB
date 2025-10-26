const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    index: true,
    // Will be auto-generated as 001, 002, 003, etc.
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function(v) {
        // Allow empty or valid E.164 format (+1234567890)
        return !v || /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Phone number must be in E.164 format (e.g., +1234567890)'
    }
  },
  avatar: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows null values but enforces uniqueness when present
    index: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // password required only if not Google user
    }
  },
  role: {
    type: String,
    enum: ['manager', 'admin'],
    default: 'manager'
  },
  plantation: {
    name: { type: String, trim: true },
    location: { type: String, trim: true },
    fields: [{ type: String }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  permissions: {
    canViewCameras: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageSettings: { type: Boolean, default: false },
    canManageStaff: { type: Boolean, default: false }
  },
  alertPreferences: {
    enableSMS: { type: Boolean, default: true },
    enableWhatsApp: { type: Boolean, default: true },
    enableCalls: { type: Boolean, default: true },
    criticalOnly: { type: Boolean, default: false }, // Only get critical alerts
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // 10 PM
      end: { type: String, default: '07:00' } // 7 AM
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null,
    index: true,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

// Auto-generate userId before saving
userSchema.pre('save', async function(next) {
  // Only generate userId if it's a new user and userId is not set
  if (this.isNew && !this.userId) {
    try {
      // Find the user with the highest userId
      const User = this.constructor;
      const lastUser = await User.findOne({}, { userId: 1 })
        .sort({ userId: -1 })
        .limit(1)
        .lean();
      
      let nextNumber = 1;
      if (lastUser && lastUser.userId) {
        // Extract number from userId (e.g., "001" -> 1)
        const lastNumber = parseInt(lastUser.userId, 10);
        nextNumber = lastNumber + 1;
      }
      
      // Format as 3-digit string with leading zeros (001, 002, etc.)
      this.userId = String(nextNumber).padStart(3, '0');
      console.log(`Generated userId: ${this.userId} for user: ${this.email}`);
    } catch (error) {
      console.error('Error generating userId:', error);
      return next(error);
    }
  }
  next();
});

// Note: index keys are defined in schema paths above to avoid duplicates

module.exports = mongoose.model('User', userSchema);
