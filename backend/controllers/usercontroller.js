const bcrypt = require('bcryptjs');
const User = require('../models/user');

// GET /api/users
async function listUsers(req, res) {
	try {
		const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
		res.json(users);
	} catch (err) {
		console.error('Error listing users:', err);
		res.status(500).json({ message: 'Failed to list users', error: err.message });
	}
}

// POST /api/users
async function createUser(req, res) {
  try {
    const { name, email, password, role, avatar, plantation } = req.body;
    console.log('Admin user creation request received:', { name, email, role, plantation });
    
    if (!name || !email || !password) {
      console.log('User creation validation failed: missing required fields');
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Enhanced name validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: 'Name must contain only letters and spaces (2-50 characters)' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User creation failed: email already exists', email);
      return res.status(409).json({ message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user with plantation information
    const userData = { 
      name, 
      email, 
      password: hashed, 
      role: role || 'manager', 
      avatar: avatar || null 
    };
    
    // Add plantation information if provided
    if (plantation) {
      userData.plantation = {
        name: plantation,
        location: '',
        fields: [],
        assignedBy: req.user ? req.user._id : null
      };
    }
    
    const user = await User.create(userData);
    console.log('User created successfully by admin:', { id: user._id, name: user.name, email: user.email, role: user.role, plantation: user.plantation });
    const { password: _, ...safe } = user.toObject();
    
    // Send welcome email
    console.log('Attempting to send welcome email for admin-created user:', { name: user.name, email: user.email, role: user.role });
    const { sendWelcomeEmail } = require('../services/emailservices');
    sendWelcomeEmail(user)
      .then(() => console.log('Welcome email process completed for admin-created user:', user.email))
      .catch(err => console.error('Failed to send welcome email for admin-created user:', err));
    
    res.status(201).json(safe);
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
}

// POST /api/users/seed
async function seedUsers(req, res) {
	try {
		const seed = [
			{ name: 'Admin User', email: 'admin@sads.local', password: 'Admin#123', role: 'admin', avatar: null },
			{ name: 'Alice Johnson', email: 'alice@sads.local', password: 'Password#1', role: 'user', avatar: null },
			{ name: 'Bob Smith', email: 'bob@sads.local', password: 'Password#1', role: 'user', avatar: null },
			{ name: 'Carol Garcia', email: 'carol@sads.local', password: 'Password#1', role: 'user', avatar: null }
		];
		const emails = seed.map(u => u.email);
		const existing = await User.find({ email: { $in: emails } }).select('email');
		const existingSet = new Set(existing.map(u => u.email));
		const toInsert = await Promise.all(seed
			.filter(u => !existingSet.has(u.email))
			.map(async u => ({
				...u,
				password: await bcrypt.hash(u.password, 10)
			}))
		);
		let inserted = [];
		if (toInsert.length > 0) {
			inserted = await User.insertMany(toInsert);
		}
		res.json({ inserted: inserted.length, skipped: existingSet.size, total: seed.length });
	} catch (err) {
		console.error('Error seeding users:', err);
		res.status(500).json({ message: 'Failed to seed users', error: err.message });
	}
}

module.exports = { listUsers, createUser, seedUsers };

// Manager self-update (email/password)
module.exports.updateSelf = async function updateSelf(req, res) {
  try {
    const userId = req.user._id;
    const { email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      // Ensure email not used by another account
      const exists = await User.findOne({ email, _id: { $ne: userId } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const { password: _, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// New function to update user credentials by admin
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone, avatar, plantation, permissions, isActive } = req.body;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store original values for comparison
    const originalRole = user.role;
    const originalPermissions = { ...user.permissions };
    const originalEmail = user.email;
    const originalIsActive = user.isActive; // Store original isActive separately
    const originalUser = { ...user.toObject() };
    
    console.log('Updating user:', { 
      userId: user._id, 
      name: user.name, 
      originalIsActive,
      newIsActive: isActive,
      isActiveProvided: isActive !== undefined 
    });
    
    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use by another user' });
      }
      user.email = email;
    }
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    
    // Handle plantation update - ensure it's an object
    if (plantation !== undefined) {
      if (typeof plantation === 'string') {
        // If plantation is a string, convert it to object format
        user.plantation = {
          name: plantation,
          location: '',
          fields: []
        };
      } else if (plantation && typeof plantation === 'object') {
        // If it's already an object, use it directly
        user.plantation = plantation;
      } else if (plantation === null || plantation === '') {
        // If null or empty string, clear the plantation
        user.plantation = undefined;
      }
    }
    
    if (permissions !== undefined) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;
    
    // Hash password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Save updated user
    await user.save();
    
    // Notify manager if their credentials were updated
    if ((originalRole === 'manager' || user.role === 'manager') && (password || email !== originalEmail)) {
      const { notifyManagerCredentialUpdate } = require('../services/emailservices');
      // Send notification (non-blocking)
      notifyManagerCredentialUpdate(user, req.user)
        .catch(err => console.error('Failed to send credential update notification:', err));
    }
    
    // Notify manager if their permissions were updated
    if ((originalRole === 'manager' || user.role === 'manager') && permissions) {
      // Compare permissions to find what changed
      const permissionChanges = {};
      for (const [key, value] of Object.entries(permissions)) {
        if (originalPermissions[key] !== value) {
          permissionChanges[key] = value;
        }
      }
      
      // Only send notification if there were actual changes
      if (Object.keys(permissionChanges).length > 0) {
        const { notifyManagerPermissionUpdate } = require('../services/emailservices');
        // Send notification (non-blocking)
        notifyManagerPermissionUpdate(user, req.user, permissionChanges)
          .catch(err => console.error('Failed to send permission update notification:', err));
      }
    }
    
    // Notify manager if their account status was changed
    if ((originalRole === 'manager' || user.role === 'manager') && isActive !== undefined && user.isActive !== originalIsActive) {
      console.log('Account status changed! Sending email notification:', {
        managerId: user._id,
        managerName: user.name,
        managerEmail: user.email,
        oldStatus: originalIsActive ? 'Active' : 'Blocked',
        newStatus: user.isActive ? 'Active' : 'Blocked',
        adminName: req.user.name,
        adminEmail: req.user.email
      });
      
      const { notifyManagerStatusChange } = require('../services/emailservices');
      // Send notification (non-blocking)
      notifyManagerStatusChange(user, req.user, user.isActive)
        .then(() => {
          console.log('✅ Status change email sent successfully to:', user.email);
        })
        .catch(err => {
          console.error('❌ Failed to send status change notification:', err);
          console.error('Error details:', err.message);
        });
    } else {
      console.log('Status change notification skipped:', {
        isManager: (originalRole === 'manager' || user.role === 'manager'),
        isActiveProvided: isActive !== undefined,
        statusChanged: user.isActive !== originalIsActive,
        originalIsActive,
        newIsActive: user.isActive
      });
    }
    
    const { password: _, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
}

// New function to delete a user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deletion of the requesting user (can't delete yourself)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    // Notify admins about user deletion
    const admins = await User.find({ role: 'admin' }).select('email');
    if (admins.length > 0) {
      const { sendEmail } = require('../services/emailservices');
      const adminEmails = admins.filter(a => a.email).map(a => a.email);
      sendEmail({
        to: adminEmails.join(','),
        subject: `User Account Deleted: ${user.email}`,
        html: `
          <h2>User Account Deleted</h2>
          <p>Hello,</p>
          <p>The following user account has been deleted by an administrator:</p>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
            <li><strong>Deleted by:</strong> ${req.user.name} (${req.user.email})</li>
            <li><strong>Deleted at:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Best regards,<br/>SADS User Management System</p>
        `,
      }).catch(err => console.error('Failed to send user deletion notification:', err));
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
}

// Export the new functions
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
