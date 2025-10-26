const User = require('../models/user');
const Property = require('../models/property');

// GET /api/plantations - Get all plantations with assigned managers
async function getPlantations(req, res) {
  try {
    const plantations = await Property.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $unwind: '$manager'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          status: 1,
          cameraCount: 1,
          plantation: 1,
          manager: {
            _id: 1,
            name: 1,
            email: 1,
            isActive: 1
          },
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(plantations);
  } catch (err) {
    console.error('Error getting plantations:', err);
    res.status(500).json({ message: 'Failed to get plantations', error: err.message });
  }
}

// POST /api/plantations/assign - Assign manager to plantation
async function assignManagerToPlantation(req, res) {
  try {
    const { propertyId, managerId, plantationInfo } = req.body;
    
    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Validate manager exists and is active
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    if (manager.role !== 'manager') {
      return res.status(400).json({ message: 'User must be a manager' });
    }
    
    if (!manager.isActive) {
      return res.status(400).json({ message: 'Manager account is inactive' });
    }
    
    // Update property with new manager and plantation info
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      {
        managerId: managerId,
        plantation: plantationInfo || property.plantation
      },
      { new: true }
    ).populate('managerId', 'name email isActive');
    
    // Update manager's plantation info
    await User.findByIdAndUpdate(managerId, {
      plantation: {
        name: plantationInfo?.name || property.plantation?.name || property.name,
        location: plantationInfo?.location || property.plantation?.location || property.address,
        fields: plantationInfo?.fields || property.plantation?.fields || [],
        assignedBy: req.user._id
      }
    });
    
    // Send notification email to manager
    const { notifyManagerPlantationAssignment } = require('../services/emailservices');
    notifyManagerPlantationAssignment(manager, updatedProperty, req.user)
      .catch(err => console.error('Failed to send plantation assignment notification:', err));
    
    res.json(updatedProperty);
  } catch (err) {
    console.error('Error assigning manager to plantation:', err);
    res.status(500).json({ message: 'Failed to assign manager to plantation', error: err.message });
  }
}

// GET /api/plantations/unassigned - Get managers without plantations
async function getUnassignedManagers(req, res) {
  try {
    const unassignedManagers = await User.find({
      role: 'manager',
      isActive: true,
      $or: [
        { 'plantation.name': { $exists: false } },
        { 'plantation.name': { $eq: null } },
        { 'plantation.name': { $eq: '' } }
      ]
    }).select('name email plantation createdAt');
    
    res.json(unassignedManagers);
  } catch (err) {
    console.error('Error getting unassigned managers:', err);
    res.status(500).json({ message: 'Failed to get unassigned managers', error: err.message });
  }
}

// GET /api/plantations/manager/:managerId - Get plantations assigned to specific manager
async function getManagerPlantations(req, res) {
  try {
    const { managerId } = req.params;
    
    // If user is manager, only show their own plantations
    if (req.user.role === 'manager' && req.user._id.toString() !== managerId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const plantations = await Property.find({ managerId })
      .populate('managerId', 'name email isActive')
      .sort({ createdAt: -1 });
    
    res.json(plantations);
  } catch (err) {
    console.error('Error getting manager plantations:', err);
    res.status(500).json({ message: 'Failed to get manager plantations', error: err.message });
  }
}

module.exports = {
  getPlantations,
  assignManagerToPlantation,
  getUnassignedManagers,
  getManagerPlantations
};
