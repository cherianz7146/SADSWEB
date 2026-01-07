const ManagerProfile = require('../models/managerProfile');
const User = require('../models/user');
const Detection = require('../models/detection');
const Property = require('../models/property');
const Device = require('../models/device');

// Helper function to calculate stats for a manager
exports.calculateManagerStats = async function calculateManagerStats(managerId) {
  try {
    // Get detections count
    const totalDetections = await Detection.countDocuments({ userId: managerId });
    
    // Get properties count
    const totalProperties = await Property.countDocuments({ managerId: managerId });
    
    // Get cameras count (through properties)
    const properties = await Property.find({ managerId: managerId }).select('_id');
    const propertyIds = properties.map(p => p._id);
    const totalCameras = await Device.countDocuments({ propertyId: { $in: propertyIds } });
    
    // Get alerts sent (from notifications)
    const Notification = require('../models/notification');
    const totalAlertsSent = await Notification.countDocuments({ userId: managerId });
    
    // Calculate average response time (placeholder - would need actual response tracking)
    const averageResponseTime = 0; // TODO: Implement actual response time tracking
    
    // Get most detected animal
    const animalStats = await Detection.aggregate([
      { $match: { userId: managerId } },
      { $group: { _id: '$animalName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostDetectedAnimal = animalStats.length > 0 ? animalStats[0]._id : null;
    
    // Calculate average confidence
    const confidenceStats = await Detection.aggregate([
      { $match: { userId: managerId } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);
    const averageConfidence = confidenceStats.length > 0 ? Math.round(confidenceStats[0].avgConfidence) : 0;
    
    // Calculate uptime (placeholder - would need device health data)
    const totalUptime = 0; // TODO: Calculate from device health
    
    return {
      totalDetections,
      totalProperties,
      totalCameras,
      totalAlertsSent,
      averageResponseTime,
      mostDetectedAnimal,
      averageConfidence,
      totalUptime
    };
  } catch (error) {
    console.error('Error calculating manager stats:', error);
    return {
      totalDetections: 0,
      totalProperties: 0,
      totalCameras: 0,
      totalAlertsSent: 0,
      averageResponseTime: 0,
      mostDetectedAnimal: null,
      averageConfidence: 0,
      totalUptime: 0
    };
  }
}

// GET /api/manager-profiles - Get all manager profiles (admin only)
exports.getAllManagerProfiles = async (req, res) => {
  try {
    const profiles = await ManagerProfile.find()
      .populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt')
      .sort({ createdAt: -1 });
    
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching manager profiles:', error);
    res.status(500).json({ message: 'Failed to fetch manager profiles', error: error.message });
  }
};

// GET /api/manager-profiles/:id - Get a specific manager profile
exports.getManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id.toString() === id;
    
    // Only allow admins or the profile owner to view
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    let profile = await ManagerProfile.findOne({ Manager_Id: id })
      .populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    
    // If profile doesn't exist, create it
    if (!profile) {
      const user = await User.findById(id);
      if (!user || user.role !== 'manager') {
        return res.status(404).json({ message: 'Manager not found' });
      }
      
      // Calculate initial stats
      const stats = await exports.calculateManagerStats(id);
      
      profile = await ManagerProfile.create({
        Manager_Id: id,
        accountCreatedAt: user.createdAt,
        lastLoginAt: user.lastLogin,
        totalLoginCount: user.lastLogin ? 1 : 0,
        ...stats
      });
      
      await profile.populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    } else {
      // Update stats
      const stats = await exports.calculateManagerStats(id);
      Object.assign(profile, stats);
      profile.lastActiveDate = new Date();
      profile.calculatePerformanceScore();
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    res.status(500).json({ message: 'Failed to fetch manager profile', error: error.message });
  }
};

// GET /api/manager-profiles/me - Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Use req.user.id (set by auth middleware)
    
    if (!userId) {
      console.error('getMyProfile: User ID not found in req.user:', req.user);
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    console.log('getMyProfile: Fetching profile for userId:', userId);
    
    let profile = await ManagerProfile.findOne({ Manager_Id: userId })
      .populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    
    // If profile doesn't exist, create it
    if (!profile) {
      console.log('getMyProfile: Profile not found, creating new profile for userId:', userId);
      const user = await User.findById(userId);
      if (!user) {
        console.error('getMyProfile: User not found in database for userId:', userId);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate initial stats
      const stats = await exports.calculateManagerStats(userId);
      
      profile = await ManagerProfile.create({
        Manager_Id: userId,
        accountCreatedAt: user.createdAt,
        lastLoginAt: user.lastLogin,
        totalLoginCount: user.lastLogin ? 1 : 0,
        ...stats
      });
      
      await profile.populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
      console.log('getMyProfile: Created new profile for userId:', userId);
    } else {
      // Update stats
      const stats = await exports.calculateManagerStats(userId);
      Object.assign(profile, stats);
      profile.lastActiveDate = new Date();
      profile.calculatePerformanceScore();
      await profile.save();
      console.log('getMyProfile: Updated existing profile for userId:', userId);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching my profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// POST /api/manager-profiles - Create a manager profile (admin only)
exports.createManagerProfile = async (req, res) => {
  try {
    const { Manager_Id } = req.body;
    
    // Check if user exists and is a manager
    const user = await User.findById(Manager_Id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'manager') {
      return res.status(400).json({ message: 'User is not a manager' });
    }
    
    // Check if profile already exists
    const existing = await ManagerProfile.findOne({ Manager_Id });
    if (existing) {
      return res.status(409).json({ message: 'Profile already exists' });
    }
    
    // Calculate initial stats
    const stats = await exports.calculateManagerStats(Manager_Id);
    
    const profile = await ManagerProfile.create({
      Manager_Id,
      accountCreatedAt: user.createdAt,
      lastLoginAt: user.lastLogin,
      totalLoginCount: user.lastLogin ? 1 : 0,
      ...stats
    });
    
    profile.calculatePerformanceScore();
    await profile.save();
    
    await profile.populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    
    // Log activity (non-blocking) - only for admin
    if (req.user && req.user.role === 'admin') {
      const { logActivity, getIpAddress } = require('../utils/activityLogger');
      logActivity(
        req.user._id,
        'manager_profile_created',
        `Created manager profile: ${user.name} (${user.email})`,
        { 
          profileId: profile._id.toString(), 
          managerId: Manager_Id,
          managerName: user.name,
          managerEmail: user.email
        },
        getIpAddress(req)
      ).catch(err => console.error('Failed to log manager profile creation activity:', err));
    }
    
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating manager profile:', error);
    res.status(500).json({ message: 'Failed to create manager profile', error: error.message });
  }
};

// PUT /api/manager-profiles/:id - Update a manager profile (admin only)
exports.updateManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating Manager_Id
    delete updates.Manager_Id;
    
    const profile = await ManagerProfile.findOne({ Manager_Id: id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Update fields
    Object.assign(profile, updates);
    
    // Recalculate performance score if relevant fields changed
    if (updates.averageResponseTime !== undefined || 
        updates.totalUptime !== undefined || 
        updates.averageConfidence !== undefined) {
      profile.calculatePerformanceScore();
    }
    
    await profile.save();
    await profile.populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    
    // Log activity (non-blocking) - only for admin
    if (req.user && req.user.role === 'admin') {
      const { logActivity, getIpAddress } = require('../utils/activityLogger');
      const managerName = profile.Manager_Id?.name || 'Unknown';
      logActivity(
        req.user._id,
        'manager_profile_updated',
        `Updated manager profile: ${managerName}`,
        { 
          profileId: profile._id.toString(), 
          managerId: id,
          managerName: managerName,
          changes: Object.keys(updates)
        },
        getIpAddress(req)
      ).catch(err => console.error('Failed to log manager profile update activity:', err));
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating manager profile:', error);
    res.status(500).json({ message: 'Failed to update manager profile', error: error.message });
  }
};

// DELETE /api/manager-profiles/:id - Delete a manager profile (admin only)
exports.deleteManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await ManagerProfile.findOneAndDelete({ Manager_Id: id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ message: 'Manager profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting manager profile:', error);
    res.status(500).json({ message: 'Failed to delete manager profile', error: error.message });
  }
};

// POST /api/manager-profiles/:id/refresh - Refresh stats for a manager profile
exports.refreshManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await ManagerProfile.findOne({ Manager_Id: id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Recalculate stats
    const stats = await exports.calculateManagerStats(id);
    Object.assign(profile, stats);
    profile.lastActiveDate = new Date();
    profile.calculatePerformanceScore();
    await profile.save();
    
    await profile.populate('Manager_Id', 'name email phone role avatar isActive lastLogin createdAt userId');
    
    res.json(profile);
  } catch (error) {
    console.error('Error refreshing manager profile:', error);
    res.status(500).json({ message: 'Failed to refresh manager profile', error: error.message });
  }
};

// POST /api/manager-profiles/sync-all - Sync all managers to manager profiles
exports.syncAllManagers = async (req, res) => {
  try {
    // Get all users with role 'manager'
    const managers = await User.find({ role: 'manager' });
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    
    for (const manager of managers) {
      try {
        // Check if profile already exists
        let profile = await ManagerProfile.findOne({ Manager_Id: manager._id });
        
        if (!profile) {
          // Create new profile
          const stats = await exports.calculateManagerStats(manager._id.toString());
          
          profile = await ManagerProfile.create({
            Manager_Id: manager._id,
            accountCreatedAt: manager.createdAt,
            lastLoginAt: manager.lastLogin,
            totalLoginCount: manager.lastLogin ? 1 : 0,
            ...stats
          });
          
          profile.calculatePerformanceScore();
          await profile.save();
          created++;
          console.log(`✅ Created profile for manager: ${manager.name} (${manager.email})`);
        } else {
          // Update existing profile stats
          const stats = await exports.calculateManagerStats(manager._id.toString());
          Object.assign(profile, stats);
          profile.lastActiveDate = new Date();
          profile.calculatePerformanceScore();
          await profile.save();
          updated++;
          console.log(`🔄 Updated profile for manager: ${manager.name} (${manager.email})`);
        }
      } catch (error) {
        console.error(`❌ Error processing manager ${manager.name} (${manager.email}):`, error.message);
        errors.push({
          managerId: manager._id,
          managerName: manager.name,
          managerEmail: manager.email,
          error: error.message
        });
        skipped++;
      }
    }
    
    res.json({
      success: true,
      message: `Sync completed: ${created} created, ${updated} updated, ${skipped} skipped`,
      summary: {
        totalManagers: managers.length,
        created,
        updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Error syncing all managers:', error);
    res.status(500).json({ message: 'Failed to sync managers', error: error.message });
  }
};

