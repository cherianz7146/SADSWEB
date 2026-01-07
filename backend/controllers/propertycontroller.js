const Property = require('../models/property');
const User = require('../models/user');

// GET /api/properties
async function listProperties(req, res) {
  try {
    const { managerId, status } = req.query;
    let query = {};
    
    // If user is manager, only show their properties
    if (req.user.role === 'manager') {
      query.managerId = req.user.id;
    } else if (managerId) {
      query.managerId = managerId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const properties = await Property.find(query)
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(properties);
  } catch (err) {
    console.error('Error listing properties:', err);
    res.status(500).json({ message: 'Failed to list properties', error: err.message });
  }
}

// GET /api/properties/my-property - Get current user's property
async function getMyProperty(req, res) {
  try {
    const property = await Property.findOne({ managerId: req.user.id })
      .populate('managerId', 'name email');
    
    if (!property) {
      return res.status(404).json({ message: 'No property assigned to this user' });
    }
    
    res.json(property);
  } catch (err) {
    console.error('Error getting user property:', err);
    res.status(500).json({ message: 'Failed to get user property', error: err.message });
  }
}

// GET /api/properties/:id
async function getProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id)
      .populate('managerId', 'name email');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access to this property
    if (req.user.role === 'manager' && property.managerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(property);
  } catch (err) {
    console.error('Error getting property:', err);
    res.status(500).json({ message: 'Failed to get property', error: err.message });
  }
}

// POST /api/properties
async function createProperty(req, res) {
  try {
    const { name, address, description, cameraCount, managerId, location, settings } = req.body;
    
    // Validate manager exists
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(400).json({ message: 'Manager not found' });
    }
    
    if (manager.role !== 'manager') {
      return res.status(400).json({ message: 'Assigned user must be a manager' });
    }
    
    const property = new Property({
      name,
      address,
      description,
      cameraCount: cameraCount || 0,
      managerId,
      location,
      settings: settings || {}
    });
    
    await property.save();
    await property.populate('managerId', 'name email');
    
    // Log activity (non-blocking) - only for admin
    if (req.user && req.user.role === 'admin') {
      const { logActivity, getIpAddress } = require('../utils/activityLogger');
      logActivity(
        req.user._id,
        'property_created',
        `Created property: ${property.name}`,
        { 
          propertyId: property._id.toString(), 
          propertyName: property.name, 
          managerId: managerId,
          managerName: manager.name
        },
        getIpAddress(req)
      ).catch(err => console.error('Failed to log property creation activity:', err));
    }
    
    res.status(201).json(property);
  } catch (err) {
    console.error('Error creating property:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    res.status(500).json({ message: 'Failed to create property', error: err.message });
  }
}

// PUT /api/properties/:id
async function updateProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access to this property
    if (req.user.role === 'manager' && property.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { name, address, description, cameraCount, managerId, status, location, settings, images, profileImage } = req.body;
    
    if (managerId && managerId !== property.managerId.toString()) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ message: 'Invalid manager' });
      }
    }
    
    if (name !== undefined) property.name = name;
    if (images !== undefined) property.images = images;
    if (address !== undefined) property.address = address;
    if (description !== undefined) property.description = description;
    if (cameraCount !== undefined) property.cameraCount = cameraCount;
    if (managerId !== undefined) property.managerId = managerId;
    if (status !== undefined) property.status = status;
    if (location !== undefined) property.location = location;
    if (settings !== undefined) property.settings = { ...property.settings, ...settings };
    if (profileImage !== undefined) property.profileImage = profileImage;
    
    await property.save();
    await property.populate('managerId', 'name email');
    
    // Log activity (non-blocking) - only for admin
    if (req.user && req.user.role === 'admin') {
      const { logActivity, getIpAddress } = require('../utils/activityLogger');
      const changes = [];
      if (name !== undefined) changes.push('name');
      if (address !== undefined) changes.push('address');
      if (status !== undefined) changes.push('status');
      if (managerId !== undefined) changes.push('manager');
      if (cameraCount !== undefined) changes.push('cameras');
      
      if (changes.length > 0) {
        logActivity(
          req.user._id,
          'property_updated',
          `Updated property: ${property.name} - Changed: ${changes.join(', ')}`,
          { 
            propertyId: property._id.toString(), 
            propertyName: property.name,
            changes: changes
          },
          getIpAddress(req)
        ).catch(err => console.error('Failed to log property update activity:', err));
      }
    }
    
    res.json(property);
  } catch (err) {
    console.error('Error updating property:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', details: messages });
    }
    res.status(500).json({ message: 'Failed to update property', error: err.message });
  }
}

// DELETE /api/properties/:id
async function deleteProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access to this property
    if (req.user.role === 'manager' && property.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ message: 'Failed to delete property', error: err.message });
  }
}

// GET /api/properties/stats
async function getPropertyStats(req, res) {
  try {
    let matchQuery = {};
    
    // If user is manager, only show their properties
    if (req.user.role === 'manager') {
      matchQuery.managerId = req.user.id;
    }
    
    const stats = await Property.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
          totalCameras: { $sum: '$cameraCount' }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, inactive: 0, maintenance: 0, totalCameras: 0 };
    res.json(result);
  } catch (err) {
    console.error('Error getting property stats:', err);
    res.status(500).json({ message: 'Failed to get property stats', error: err.message });
  }
}

module.exports = {
  listProperties,
  getProperty,
  getMyProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats
};

