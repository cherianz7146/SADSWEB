const express = require('express');
const router = express.Router();
const { 
  listProperties, 
  getProperty,
  getMyProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  getPropertyStats 
} = require('../controllers/propertycontroller');
const { authRequired } = require('../middleware/auth');

// All routes require authentication
router.use(authRequired);

// GET /api/properties - List all properties (filtered by user role)
router.get('/', listProperties);

// GET /api/properties/my-property - Get current user's property (must be before /:id)
router.get('/my-property', getMyProperty);

// GET /api/properties/stats - Get property statistics
router.get('/stats', getPropertyStats);

// GET /api/properties/:id - Get specific property
router.get('/:id', getProperty);

// POST /api/properties - Create new property (admin only)
router.post('/', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, createProperty);

// PUT /api/properties/:id - Update property
router.put('/:id', updateProperty);

// POST /api/properties/:id/images - Add image to property
router.post('/:id/images', async (req, res) => {
  try {
    const Property = require('../models/property');
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access
    if (req.user.role === 'manager' && property.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { image } = req.body; // Base64 encoded image
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    if (!property.images) {
      property.images = [];
    }
    property.images.push(image);
    await property.save();
    
    res.json({ images: property.images });
  } catch (err) {
    console.error('Error adding image:', err);
    res.status(500).json({ message: 'Failed to add image', error: err.message });
  }
});

// DELETE /api/properties/:id/images/:imageIndex - Delete image from property
router.delete('/:id/images/:imageIndex', async (req, res) => {
  try {
    const Property = require('../models/property');
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access
    if (req.user.role === 'manager' && property.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    if (isNaN(imageIndex) || !property.images || imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }
    
    property.images.splice(imageIndex, 1);
    await property.save();
    
    res.json({ images: property.images });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Failed to delete image', error: err.message });
  }
});

// DELETE /api/properties/:id - Delete property (admin only)
router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, deleteProperty);

module.exports = router;

