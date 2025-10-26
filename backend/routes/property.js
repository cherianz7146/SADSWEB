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

// DELETE /api/properties/:id - Delete property (admin only)
router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, deleteProperty);

module.exports = router;

