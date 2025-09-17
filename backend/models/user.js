const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Note: index keys are defined in schema paths above to avoid duplicates

module.exports = mongoose.model('User', userSchema);
